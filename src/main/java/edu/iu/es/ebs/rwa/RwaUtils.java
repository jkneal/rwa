package edu.iu.es.ebs.rwa;

import edu.iu.es.ebs.rwa.domain.AdminArrangementDto;
import edu.iu.es.ebs.rwa.domain.Job;
import edu.iu.es.ebs.rwa.domain.Person;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class RwaUtils {
    public static List<List<String>> partitionToStreams(List<String> values, int numStreams) {
        int size = values.size() / numStreams;
        if (size < 1) {
            size = 1;
        }
        return partitionList(values, size);
    }

    public static List<List<String>> partitionList(List<String> values, int size) {
        List<List<String>> partitions = new ArrayList<>();
        int start = 0;
        while (start < values.size()) {
            int end = start + size;
            if (end > values.size()) {
                end = values.size();
            }
            List<String> partition = values.subList(start, end);
            partitions.add(partition);
            start = end;
        }
        return partitions;
    }

    public static Job getCurrentJob(Person person, EmployeeJobKey key) {
        List<Job> jobs = person.getJobs();
        if(jobs == null || jobs.isEmpty()) {
            return null;
        }

        for(Job job : jobs) {
            if(key.getJobRecordNumber() == job.getJobRecordNumber()){
                if(StringUtils.equals(key.getJobPositionNumber(), job.getJobPositionNumber())){
                    return job;
                }
            }
        }

        return null;
    }

    @Getter
    @Setter
    public static class EmployeeJobKey {
        private String employeeId;
        private String jobPositionNumber;
        private int jobRecordNumber;

        public EmployeeJobKey(AdminArrangementDto a) {
            this.employeeId = a.getEmployeeId();
            this.jobPositionNumber = a.getJobPositionNumber();
            this.jobRecordNumber = a.getJobRecordNumber();
        }

        public EmployeeJobKey(String employeeId, String jobPositionNumber, int jobRecordNumber) {
            this.employeeId = employeeId;
            this.jobPositionNumber = jobPositionNumber;
            this.jobRecordNumber = jobRecordNumber;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            EmployeeJobKey that = (EmployeeJobKey) o;
            return jobRecordNumber == that.jobRecordNumber && Objects.equals(employeeId, that.employeeId) && Objects.equals(jobPositionNumber, that.jobPositionNumber);
        }

        @Override
        public int hashCode() {
            return Objects.hash(employeeId, jobRecordNumber, jobPositionNumber);
        }
    }
}
