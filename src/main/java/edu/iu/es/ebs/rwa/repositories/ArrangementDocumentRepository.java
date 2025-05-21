package edu.iu.es.ebs.rwa.repositories;

import edu.iu.es.ebs.rwa.domain.ArrangementDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ArrangementDocumentRepository extends JpaRepository<ArrangementDocument, String> {

    @Query("SELECT d FROM ArrangementDocument d WHERE d.job.emplid = :emplid " +
        " and d.job.jobRecordNumber = :jobRecordNumber and d.job.jobPositionNumber = :jobPositionNumber " +
        " and d.status not in ('P','S') order by d.createTimestamp desc")
    List<ArrangementDocument> findByJobId(@Param("emplid") String emplid, @Param("jobRecordNumber") int jobRecordNumber,
                                          @Param("jobPositionNumber") String jobPositionNumber);

    @Query("SELECT d FROM ArrangementDocument d WHERE d.job.emplid = :emplid " +
            " and d.status not in ('P','S') order by d.createTimestamp desc")
    List<ArrangementDocument> findByEmplId(@Param("emplid") String emplid);


    // Selects the most recent completed arrangement which was approved 365 days ago
    // and which has a null or future end date
    // 2.Jul.2024: the modulus (%) below selects arrangements that were approved 365*n days ago, not just 365 days ago
    @Query(value =
            "select t3.*" +
                    "            from" +
                    "                (" +
                    "                    select emplid, job_rcd_nbr, job_position_nbr, max(completed_ts) as maxTs" +
                    "                    from completed_arrangement_t" +
                    "                    group by emplid, job_rcd_nbr, job_position_nbr" +
                    "                ) t1 " +
                    "                    join completed_arrangement_t t2 on" +
                    "                        t1.emplid = t2.emplid and" +
                    "                        t1.job_position_nbr = t2.job_position_nbr and" +
                    "                        t1.job_rcd_nbr = t2.job_rcd_nbr and" +
                    "                        t1.maxTs = t2.completed_ts" +
                    "                    join arrangement_doc_t t3 on" +
                    "                        t3.fdoc_nbr = t2.last_updt_doc_nbr" +
                    "                where" +
                    "                            (" +
                    "                               extract(day from (current_timestamp - t2.completed_ts)) != 0 and" +
                    "                               extract(day from (current_timestamp - t2.completed_ts)) % 365 = 0" +
                    "                            )" +
                    "                and" +
                    "                        (t3.remote_work_end_dt is null or DATE(t3.remote_work_end_dt) > current_timestamp\\:\\:TIMESTAMP\\:\\:DATE)", nativeQuery = true)
    List<ArrangementDocument> findArrangementsEligibleForReview();

    @Query(value =
            "select t3.*" +
                    "            from" +
                    "                (" +
                    "                    select emplid, job_rcd_nbr, max(completed_ts) as maxTs" +
                    "                    from completed_arrangement_t" +
                    "                    group by emplid, job_rcd_nbr" +
                    "                ) t1 " +
                    "                    join completed_arrangement_t t2 on" +
                    "                        t1.emplid = t2.emplid and" +
                    "                        t1.job_rcd_nbr = t2.job_rcd_nbr and" +
                    "                        t1.maxTs = t2.completed_ts" +
                    "                    join arrangement_doc_t t3 on" +
                    "                        t3.fdoc_nbr = t2.last_updt_doc_nbr" +
                    "                where t3.remote_work_end_dt is not null and DATE(t3.remote_work_end_dt) = current_date + INTERVAL '30' DAY", nativeQuery = true)
    List<ArrangementDocument> findArrangementsExpiringSoon();

    @Query(value = "SELECT d FROM ArrangementDocument d WHERE d.employeeFirstName is NULL or d.employeeLastName is NULL")
    List<ArrangementDocument> findDocumentsWithMissingNames();

    @Query(value = "SELECT a.* FROM arrangement_doc_t a join completed_arrangement_t c on a.fdoc_nbr = c.last_updt_doc_nbr " +
            " where a.remote_work_end_dt is NULL or a.remote_work_end_dt > current_date",
            nativeQuery = true)
    List<ArrangementDocument> findCompletedArrangementsWithNoOrFutureEndDate();

    @Query(value = "SELECT aDoc FROM ArrangementDocument aDoc WHERE aDoc.status = 'R' AND aDoc.createTimestamp <= :before")
    List<ArrangementDocument> findEnrouteArrangementsOlderThan(@Param("before") LocalDateTime before);

    @Query(value = "SELECT aDoc FROM ArrangementDocument aDoc WHERE aDoc.status = 'R' AND aDoc.createTimestamp > :after AND aDoc.createTimestamp < :before")
    List<ArrangementDocument> findEnrouteArrangementsBetween(@Param("after") LocalDateTime after, @Param("before") LocalDateTime before);

    @Query("SELECT d FROM ArrangementDocument d WHERE d.job.emplid = :emplid " +
            " and d.job.jobRecordNumber = :jobRecordNumber " +
            " and d.status = 'C' order by d.createTimestamp desc")
    List<ArrangementDocument> findCompletedByJobRec(@Param("emplid") String emplid, @Param("jobRecordNumber") int jobRecordNumber);
}
