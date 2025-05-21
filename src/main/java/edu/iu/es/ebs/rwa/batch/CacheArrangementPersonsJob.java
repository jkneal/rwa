package edu.iu.es.ebs.rwa.batch;

import edu.iu.es.ebs.rwa.RwaUtils;
import edu.iu.es.ebs.rwa.RwaUtils.EmployeeJobKey;
import edu.iu.es.ebs.rwa.domain.Job;
import edu.iu.es.ebs.rwa.domain.Person;
import edu.iu.es.ebs.rwa.service.PersonService;
import edu.iu.es.ebs.rwa.service.impl.PersonServiceImpl;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Component
@Profile("cache-arrangement-person-batch")
public class CacheArrangementPersonsJob implements BatchJob {

    @Autowired
    private PersonService personService;

    @Autowired
    EntityManager entityManager;

    private static final Log LOG = LogFactory.getLog(CacheArrangementPersonsJob.class);

    @Autowired
    private CacheManager cacheManager;

    @Override
    public void run() {
        int numberOfStreams = 20;

        LocalDateTime startTime = LocalDateTime.now();
        LOG.info("Started ims person cache on date " + startTime);

        LOG.info("Start clearing cache");
        cacheManager.getCache(PersonServiceImpl.Cache.GET_PERSON).clear();
        cacheManager.getCache(PersonServiceImpl.Cache.GET_PERSON_WITH_JOBS).clear();
        cacheManager.getCache(PersonServiceImpl.Cache.GET_PERSON_BY_EMPLID).clear();
        LOG.info("Finished clearing cache");

        Query querySupervisors = entityManager.createQuery(
                "select distinct a.supervisorReviewerId from ArrangementDocument a");

        List<String> originalSupervisorIds = querySupervisors.getResultList();
        Map<String, List<EmployeeJobKey>> keysByEmplid = getEmployeeJobKeyByEmplid();
        Set<String> emplids = keysByEmplid.keySet();
        Set<String> supervisorIds = new HashSet<String>();

        LocalDateTime startTime1 = null;
        LocalDateTime startTime2 = null;
        LocalDateTime startTime3 = null;
        LocalDateTime endTime1 = null;
        LocalDateTime endTime2 = null;
        LocalDateTime endTime3 = null;

        LOG.info("Adding employees: " + emplids.size());
        try {
            List<List<String>> emplidPartitions = RwaUtils.partitionToStreams(new ArrayList<>(emplids), numberOfStreams);
            startTime1 = LocalDateTime.now();
            List<Set<String>> supervisorPartitions = emplidPartitions.parallelStream().map( values ->
                    processEmployees(values, keysByEmplid)).collect(Collectors.toList());
            supervisorPartitions.stream().forEach(partition -> {
                supervisorIds.addAll(partition);
            });
            endTime1 = LocalDateTime.now();
        } catch (Exception e) {
            LOG.error("Unable to cache all employees", e);
        }
        LOG.info("Finished adding employees");

        LOG.info("Adding current supervisors: " + supervisorIds.size());
        try {
            List<List<String>> supervisorIdsPartitions = RwaUtils.partitionToStreams(new ArrayList<>(supervisorIds),
                    numberOfStreams);
            startTime2 = LocalDateTime.now();
            supervisorIdsPartitions.parallelStream().forEach(values -> getPersonByNetworkId(values));
            endTime2 = LocalDateTime.now();
        } catch (Exception e) {
            LOG.error("Unable to cache all current supervisors", e);
        }
        LOG.info("Finished adding current supervisors");

        LOG.info("Adding original supervisors: " + originalSupervisorIds.size());
        try{
            List<List<String>> originalSupervisorIdPartitions = RwaUtils.partitionToStreams(originalSupervisorIds, numberOfStreams);
            startTime3 = LocalDateTime.now();
            originalSupervisorIdPartitions.parallelStream().forEach( values -> getPersonByNetworkId(values));
            endTime3 = LocalDateTime.now();
        } catch (Exception e) {
            LOG.error("Unable to cache all original supervisors", e);
        }
        LOG.info("Finished adding original supervisors");

        LocalDateTime endTime = LocalDateTime.now();
        LOG.info("Completed ims person cache on date " + endTime);

        long duration1 = ChronoUnit.SECONDS.between(startTime1, endTime1);
        long duration2 = ChronoUnit.SECONDS.between(startTime2, endTime2);
        long duration3 = ChronoUnit.SECONDS.between(startTime3, endTime3);
        long durationTotal = ChronoUnit.SECONDS.between(startTime, endTime);

        LOG.info("Employee (" + emplids.size() + "/" + numberOfStreams +") time taken (in seconds): " + duration1);
        LOG.info("Current Supervisors (" + supervisorIds.size() + "/" + numberOfStreams + ") time taken (in seconds): "
                + duration2);
        LOG.info("Original Supervisors (" + originalSupervisorIds.size() + "/" + numberOfStreams
                + ") time taken (in seconds): " + duration3);
        LOG.info("Total time taken (in seconds): " + durationTotal);

    }

    private Set<String> processEmployees(List<String> values, Map<String, List<EmployeeJobKey>> keysByEmplid) {
        Set<String> supervisorIdTemps = new HashSet<>();
        for(String emplid : values) {
            try{
                Person person = personService.getPersonByUniversityId(emplid);
                if(person != null) {
                    for(EmployeeJobKey key : keysByEmplid.get(emplid)) {
                        Job job = RwaUtils.getCurrentJob(person, key);
                        if(job == null) {
                            continue;
                        }
                        String supervisorId = job.getReportsToUniversityId();
                        if (StringUtils.isNotBlank(supervisorId)) {
                            supervisorIdTemps.add(supervisorId);
                        }
                    }
                }
            } catch(Exception e) {
                LOG.info("Unable to cache id " + emplid);
            }
        }
        return supervisorIdTemps;
    }

    private  Map<String, List<EmployeeJobKey>> getEmployeeJobKeyByEmplid () {
        Query queryKeys = entityManager.createQuery(
                "select distinct a.job.emplid, a.job.jobPositionNumber, a.job.jobRecordNumber from ArrangementDocument a");

        List<EmployeeJobKey> keys = (List<EmployeeJobKey>) queryKeys.getResultList().stream().map(row -> {
            Object[] rowFields = (Object[]) row;
            String emplid = (String) rowFields[0];
            String position = (String) rowFields[1];
            Integer record = (Integer) rowFields[2];
            return new EmployeeJobKey(emplid, position, record);
        }).collect(Collectors.toList());

        Map<String, List<EmployeeJobKey>> keysByEmplid = keys.stream().collect(Collectors.groupingBy(
                k -> k.getEmployeeId()));

        return keysByEmplid;
    }

    private void getPersonByNetworkId(List<String> values) {
        for(String networkId : values) {
            try{
                personService.getPersonByNetworkId(networkId);
            } catch(Exception e) {
                LOG.info("Unable to cache id " + networkId);
            }
        }
    }
}
