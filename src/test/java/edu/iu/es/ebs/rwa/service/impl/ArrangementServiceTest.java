package edu.iu.es.ebs.rwa.service.impl;

import edu.iu.es.ebs.rwa.domain.*;
import edu.iu.es.ebs.rwa.repositories.ArrangementDocumentRepository;
import edu.iu.es.ebs.rwa.repositories.CompletedArrangmentRepository;
import edu.iu.es.ebs.rwa.service.AttestationService;
import edu.iu.es.ebs.rwa.service.PersonService;
import edu.iu.es.ebs.rwa.service.WorkflowService;
import edu.iu.es.ep.launchpad.notifications.domain.Notification;
import edu.iu.es.ep.launchpad.notifications.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static edu.iu.es.ebs.rwa.RwaConstants.IMS_JOB_FULL_TIME_INDICATOR;
import static edu.iu.es.ebs.rwa.domain.WorkflowDocument.STATUS_COMPLETED;
import static edu.iu.es.ebs.rwa.domain.WorkflowDocument.STATUS_ENROUTE;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ArrangementServiceTest {

    protected static final String TEST_EMPLID = "000000000";
    protected static final String TEST_NETWORK_ID = "joe";
    protected static final String TEST_SUPERVISOR_EMPLID = "001330000";
    protected static final String TEST_SUPERVISOR_NETWORK_ID = "jack";
    protected static final String TEST_CHANGED_SUPERVISOR_EMPLID = "000000123";
    protected static final String TEST_CHANGED_SUPERVISOR_NETWORKID = "changedSupervisorNetworkId";

    @InjectMocks
    @Spy
    ArrangementServiceImpl arrangementService;

    @Mock
    private WorkflowService workflowService;

    @Mock
    private PersonService personService;

    @Mock
    private ArrangementDocumentRepository arrangementDocumentRepository;

    @Mock
    private CompletedArrangmentRepository completedArrangmentRepository;

    @Mock
    AttestationService attestationService;

    @Mock
    EntityManager entityManager;

    @Mock
    NotificationService notificationService;

    @Test
    public void testCreateArrangement() {
        AttestationText attestationText = getAttestationText1();
        doReturn(attestationText).when(attestationService).getCurrentAttestation();
        Job job = getTestJob1();

        Person person = getPerson();
        doReturn(person).when(personService).getPersonByUniversityId(any());

        ArrangementDocument document = arrangementService.createArrangement(job, TEST_NETWORK_ID);

        assertNotNull(document.getJob());
        assertEquals(job.getEmplid(), document.getJob().getEmplid());
        assertEquals(document.getEmployeeFirstName(), person.getFirstName());
        assertEquals(document.getEmployeeLastName(), person.getLastName());
        assertEquals(TEST_NETWORK_ID, document.getCreateUserId());
        assertNotNull(document.getCreateTimestamp());
        assertNotNull(document.getRemoteWorkStartDate());
        assertTrue(document.isWorkAddressHome());
        assertNotNull(document.getAttestationText());
        assertEquals(Long.valueOf(1), document.getAttestationText().getId());
    }

    @Test
    public void testGetArrangement() {
        ArrangementDocument document1 = new ArrangementDocument();
        document1.setDocumentNumber("1");
        doReturn(Optional.of(document1)).when(arrangementDocumentRepository).findById(any());

        WorkflowDocument workflowDocument = getWorkflowDocument1();
        doReturn(workflowDocument).when(workflowService).getWorkflowDocument("1");

        ArrangementDocument document = arrangementService.getArrangement("1");

        assertNull(document.getWorkflowDocument());

        document1.setStatus(STATUS_ENROUTE);
        doReturn(Optional.of(document1)).when(arrangementDocumentRepository).findById(any());

        document = arrangementService.getArrangement("1");

        assertNotNull(document.getWorkflowDocument());
        assertEquals(workflowDocument.getId(), document.getWorkflowDocument().getId());
        assertEquals(workflowDocument.getStatus(), document.getWorkflowDocument().getStatus());
    }

    @Test
    public void testUpdateArrangement() {
        AttestationText attestationText = getAttestationText1();
        doReturn(attestationText).when(attestationService).getCurrentAttestation();

        Job job = getTestJob1();

        Person person = getPerson();
        doReturn(person).when(personService).getPersonByUniversityId(any());

        ArrangementDocument document1 = getArrangementDocument1();
        doReturn(Optional.of(document1)).when(arrangementDocumentRepository).findById(any());

        ArrangementDocument updateDocument = arrangementService.updateArrangement("1", TEST_NETWORK_ID);

        assertNull(updateDocument.getDocumentNumber());
        assertNull(updateDocument.getArrangementWorkDays().getDocumentNumber());
        assertNotNull(updateDocument.getJob());
        assertEquals(job.getEmplid(), updateDocument.getJob().getEmplid());
        assertEquals(updateDocument.getEmployeeFirstName(), person.getFirstName());
        assertEquals(updateDocument.getEmployeeLastName(), person.getLastName());
        assertEquals(TEST_NETWORK_ID, updateDocument.getCreateUserId());
        assertTrue(updateDocument.getCreateTimestamp().isAfter(LocalDateTime.now().minusDays(1)));
        assertNull(updateDocument.getCompletedTimestamp());
        assertNotNull(updateDocument.getAttestationText());
        assertEquals(Long.valueOf(1), updateDocument.getAttestationText().getId());
        assertTrue(updateDocument.getArrangementAdHocs().isEmpty());
        assertFalse(updateDocument.isAttestationAcknowledged());
    }

    @Test
    public void testCompleteArrangement() {
        ArrangementDocument document1 = getArrangementDocument1();
        doReturn(Optional.of(document1)).when(arrangementDocumentRepository).findById(any());

        ArgumentCaptor<ArrangementDocument> docCaptor = ArgumentCaptor.forClass(ArrangementDocument.class);
        doReturn(null).when(arrangementDocumentRepository).save(docCaptor.capture());

        doReturn(Optional.empty()).when(completedArrangmentRepository).findById(any());

        ArgumentCaptor<CompletedArrangement> completeCaptor = ArgumentCaptor.forClass(CompletedArrangement.class);
        doReturn(null).when(completedArrangmentRepository).save(completeCaptor.capture());

        doReturn(getPerson()).when(personService).getPersonByUniversityId(any());
        doReturn(getSupervisor()).when(personService).getPersonByNetworkId(any());

        ReflectionTestUtils.setField(arrangementService, "sendNotification", true);
        arrangementService.completeArrangement("1", "C");

        ArrangementDocument savedDoc = docCaptor.getValue();
        assertNotNull(savedDoc);
        assertEquals("1", savedDoc.getDocumentNumber());
        assertEquals("C", savedDoc.getStatus());
        assertTrue(savedDoc.getCompletedTimestamp().isAfter(LocalDateTime.now().minusDays(1)));

        CompletedArrangement completedArrangement = completeCaptor.getValue();
        assertNotNull(completedArrangement);
        assertEquals(completedArrangement.getEmplid(), document1.getJob().getEmplid());
        assertEquals(completedArrangement.getJobPositionNumber(), document1.getJob().getJobPositionNumber());
        assertTrue(completedArrangement.getCompletedTimetamp().isAfter(LocalDateTime.now().minusDays(1)));
        assertTrue(completedArrangement.getLastUpdateTimetamp().isAfter(LocalDateTime.now().minusDays(1)));
        assertEquals(completedArrangement.getLastUpdateDocumentNumber(), "1");

        doReturn(Optional.of(completedArrangement)).when(completedArrangmentRepository).findById(any());
        document1.setDocumentNumber("2");
        document1.getEmployee().setNetworkId(TEST_SUPERVISOR_NETWORK_ID);

        ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
        doReturn(null).when(notificationService).sendNotification(notificationCaptor.capture());

        arrangementService.completeArrangement("2", "C");

        completedArrangement = completeCaptor.getValue();
        assertNotNull(completedArrangement);
        assertEquals(completedArrangement.getLastUpdateDocumentNumber(), "2");

        Notification sentNotification = notificationCaptor.getValue();
        assertNotNull(sentNotification);
        assertEquals(TEST_SUPERVISOR_NETWORK_ID, sentNotification.getRecipients().get(0).getUsername());
        assertTrue(sentNotification.getPrimaryActionURL().contains("review/2"));
    }

    @Test
    void testExpirePreviousJobArrangements() {
        ArrangementDocument currentDoc = new ArrangementDocument();
        currentDoc.setRemoteWorkStartDate(LocalDate.of(2023, 10, 1));
        currentDoc.setJob(getTestJob1());

        ArrangementDocument previousDoc1 = new ArrangementDocument();
        previousDoc1.setDocumentNumber("doc1");
        previousDoc1.setRemoteWorkStartDate(LocalDate.of(2023, 1, 1));
        previousDoc1.setRemoteWorkEndDate(null);
        previousDoc1.setJob(getTestJob1());

        ArrangementDocument previousDoc2 = new ArrangementDocument();
        previousDoc2.setDocumentNumber("doc2");
        previousDoc2.setRemoteWorkStartDate(LocalDate.of(2023, 11, 1));
        previousDoc2.setRemoteWorkEndDate(null);
        previousDoc2.setJob(getTestJob1());

        when(arrangementDocumentRepository.findCompletedByJobRec(TEST_EMPLID, 0))
                .thenReturn(List.of(previousDoc1, previousDoc2));

        arrangementService.expirePreviousJobArrangements(currentDoc);

        assertEquals(LocalDate.of(2023, 9, 30), previousDoc1.getRemoteWorkEndDate());
        assertEquals(LocalDate.of(2023, 11, 1), previousDoc2.getRemoteWorkEndDate());

        verify(arrangementDocumentRepository, times(1)).save(previousDoc1);
        verify(arrangementDocumentRepository, times(1)).save(previousDoc2);
    }

    @Test
    public void testGetJobArrangementStatuses() {
        Person person = getPerson();
        List<Job> jobs = new ArrayList<>();
        jobs.add(getTestJob1());
        jobs.add(getTestJob2());
        person.setJobs(jobs);

        doReturn(person).when(personService).getPersonWithJobsByNetworkId(any());

        List<JobArrangementStatus> jobArrangementStatuses = arrangementService.getJobArrangementStatuses(TEST_NETWORK_ID);

        assertEquals(jobArrangementStatuses.size(), 1);
        JobArrangementStatus arrangementStatus = jobArrangementStatuses.get(0);
        assertEquals(arrangementStatus.getJob().getJobPositionNumber(), getTestJob1().getJobPositionNumber());
        assertNull(arrangementStatus.getCompletedDocument());
        assertNull(arrangementStatus.getPendingOrDisapprovedDocument());
        assertNull(arrangementStatus.getPreviousDocuments());

        person.getJobs().add(getTestJob3());

        jobArrangementStatuses = arrangementService.getJobArrangementStatuses(TEST_NETWORK_ID);

        assertEquals(jobArrangementStatuses.size(), 2);
        arrangementStatus = jobArrangementStatuses.get(1);
        assertEquals(arrangementStatus.getJob().getJobPositionNumber(), getTestJob3().getJobPositionNumber());

        List<ArrangementDocument> documents = new ArrayList<>();
        ArrangementDocument document1 = getArrangementDocument1();
        documents.add(document1);

        doReturn(documents).when(arrangementDocumentRepository).findByJobId(any(), anyInt(), any());

        jobArrangementStatuses = arrangementService.getJobArrangementStatuses(TEST_NETWORK_ID);
        arrangementStatus = jobArrangementStatuses.get(0);
        assertEquals(arrangementStatus.getJob().getJobPositionNumber(), getTestJob1().getJobPositionNumber());
        assertNull(arrangementStatus.getCompletedDocument());
        assertNotNull(arrangementStatus.getPendingOrDisapprovedDocument());
        assertEquals(arrangementStatus.getPendingOrDisapprovedDocument().getDocumentNumber(), document1.getDocumentNumber());
        assertEquals(arrangementStatus.getPreviousDocuments().size(), 0);


        document1.setStatus(STATUS_COMPLETED);
        jobArrangementStatuses = arrangementService.getJobArrangementStatuses(TEST_NETWORK_ID);
        arrangementStatus = jobArrangementStatuses.get(0);
        assertEquals(arrangementStatus.getJob().getJobPositionNumber(), getTestJob1().getJobPositionNumber());
        assertNotNull(arrangementStatus.getCompletedDocument());
        assertEquals(arrangementStatus.getCompletedDocument().getDocumentNumber(), document1.getDocumentNumber());
        assertNull(arrangementStatus.getPendingOrDisapprovedDocument());
        assertEquals(arrangementStatus.getPreviousDocuments().size(), 0);

        ArrangementDocument document2 = getArrangementDocument1();
        document2.setDocumentNumber("2");
        document2.setStatus(STATUS_COMPLETED);
        documents.add(document2);
        jobArrangementStatuses = arrangementService.getJobArrangementStatuses(TEST_NETWORK_ID);
        arrangementStatus = jobArrangementStatuses.get(0);
        assertEquals(arrangementStatus.getJob().getJobPositionNumber(), getTestJob1().getJobPositionNumber());
        assertNotNull(arrangementStatus.getCompletedDocument());
        assertEquals(arrangementStatus.getCompletedDocument().getDocumentNumber(), document1.getDocumentNumber());
        assertNull(arrangementStatus.getPendingOrDisapprovedDocument());
        assertEquals(arrangementStatus.getPreviousDocuments().size(), 1);
        assertEquals(arrangementStatus.getPreviousDocuments().get(0).getDocumentNumber(), "2");
    }

    @Test
    public void testUpdateArrangementEndDateByInactiveStep_JOB_ACTIVE() {
        ArrangementDocument arrangementDocument = getArrangementDocument1();
        List<ArrangementDocument> arrangements = List.of(arrangementDocument);
        doReturn(arrangements).when(arrangementDocumentRepository).findCompletedArrangementsWithNoOrFutureEndDate();

        Person person = getPersonHelper(arrangementDocument.getJob());
        doReturn(person).when(personService).getPersonByUniversityId(TEST_EMPLID);

        arrangementService.updateArrangementEndDateByInactiveAndOnChangedSupervisorStep(true);
        assertNull(arrangementDocument.getRemoteWorkEndDate(), "Job is still active, should not be ended");
    }

    @Test
    public void testUpdateArrangementEndDateByInactiveStep_NO_JOB() {
        ArrangementDocument arrangementDocument = getArrangementDocument1();
        List<ArrangementDocument> arrangements = List.of(arrangementDocument);
        doReturn(arrangements).when(arrangementDocumentRepository).findCompletedArrangementsWithNoOrFutureEndDate();

        Person person = getPersonHelper(null);
        doReturn(person).when(personService).getPersonByUniversityId(TEST_EMPLID);

        arrangementService.updateArrangementEndDateByInactiveAndOnChangedSupervisorStep(true);
        assertNotNull(arrangementDocument.getRemoteWorkEndDate(), "Person has no job, should be ended");
    }

    @Test
    public void testUpdateArrangementEndDateByInactiveStep_FAILED_TO_FIND_ACCOUNT() {
        ArrangementDocument arrangementDocument = getArrangementDocument1();
        List<ArrangementDocument> arrangements = List.of(arrangementDocument);
        doReturn(arrangements).when(arrangementDocumentRepository).findCompletedArrangementsWithNoOrFutureEndDate();

        RuntimeException runtimeExceptionCause = new RuntimeException("Failed to find account for university id");
        RuntimeException runtimeException = new RuntimeException(runtimeExceptionCause);
        doThrow(runtimeException).when(personService).getPersonByUniversityId(TEST_EMPLID);

        arrangementService.updateArrangementEndDateByInactiveAndOnChangedSupervisorStep(true);
        assertNotNull(arrangementDocument.getRemoteWorkEndDate(), "PersonService failed to find account for Person, should be ended");
        verify(arrangementService, times(1)).logAndSetHelper(isA(LocalDate.class), isA(ArrangementDocument.class), eq(null), eq(true), eq(false), eq(false), eq(true));
    }

    @Test
    public void testUpdateArrangementEndDateByInactiveStep_SUPERVISOR_CHANGE() {
        ArrangementDocument arrangementDocument = getArrangementDocument1();
        List<ArrangementDocument> arrangements = List.of(arrangementDocument);
        doReturn(arrangements).when(arrangementDocumentRepository).findCompletedArrangementsWithNoOrFutureEndDate();

        Job changedSupervisorJob = getTestJob1();
        changedSupervisorJob.setJobFullPartTimeIndicator(IMS_JOB_FULL_TIME_INDICATOR);
        changedSupervisorJob.setReportsToUniversityId(TEST_CHANGED_SUPERVISOR_EMPLID);
        Person employee = getPersonHelper(changedSupervisorJob);
        lenient().doReturn(employee).when(personService).getPersonByUniversityId(TEST_EMPLID);

        Person jobReportsToPerson = new Person();
        jobReportsToPerson.setNetworkId(TEST_CHANGED_SUPERVISOR_NETWORKID);
        jobReportsToPerson.setUniversityId(TEST_CHANGED_SUPERVISOR_EMPLID);
        lenient().doReturn(jobReportsToPerson).when(personService).getPersonByUniversityId(TEST_CHANGED_SUPERVISOR_EMPLID);

        arrangementService.updateArrangementEndDateByInactiveAndOnChangedSupervisorStep(true);
        assertNotNull(arrangementDocument.getRemoteWorkEndDate(), "PersonService returned Job with changed Supervisor, arrangement should be ended");
        verify(arrangementService, times(1)).logAndSetHelper(isA(LocalDate.class), isA(ArrangementDocument.class), isA(Person.class), eq(false), eq(true), eq(true), eq(true));
    }

    @Test
    public void testUpdateArrangementEndDateByInactiveStep_SUPERVISOR_CHANGE_UNKNOWN() {
        ArrangementDocument arrangementDocument = getArrangementDocument1();
        List<ArrangementDocument> arrangements = List.of(arrangementDocument);
        doReturn(arrangements).when(arrangementDocumentRepository).findCompletedArrangementsWithNoOrFutureEndDate();

        Job changedSupervisorJob = getTestJob1();
        changedSupervisorJob.setJobFullPartTimeIndicator(IMS_JOB_FULL_TIME_INDICATOR);
        changedSupervisorJob.setReportsToUniversityId(TEST_CHANGED_SUPERVISOR_EMPLID);
        Person employee = getPersonHelper(changedSupervisorJob);
        doReturn(employee).when(personService).getPersonByUniversityId(TEST_EMPLID);

        // Don't set jobReportsToPerson

        arrangementService.updateArrangementEndDateByInactiveAndOnChangedSupervisorStep(true);
        assertNull(arrangementDocument.getRemoteWorkEndDate(), "Supervisor (jobReportsToPerson) is not known, don't end this arrangement");
        verify(arrangementService, never()).logAndSetHelper(isA(LocalDate.class), isA(ArrangementDocument.class), isA(Person.class), eq(false), eq(true), eq(true), eq(true));
    }

    @Test
    public void testUpdateArrangementEndDateByInactiveStep_SUPERVISOR_CHANGE_NOT_ENABLED() {
        ArrangementDocument arrangementDocument = getArrangementDocument1();
        List<ArrangementDocument> arrangements = List.of(arrangementDocument);
        doReturn(arrangements).when(arrangementDocumentRepository).findCompletedArrangementsWithNoOrFutureEndDate();

        Job changedSupervisorJob = getTestJob1();
        changedSupervisorJob.setJobFullPartTimeIndicator(IMS_JOB_FULL_TIME_INDICATOR);
        changedSupervisorJob.setReportsToUniversityId(TEST_CHANGED_SUPERVISOR_EMPLID);
        Person employee = getPersonHelper(changedSupervisorJob);
        lenient().doReturn(employee).when(personService).getPersonByUniversityId(TEST_EMPLID);

        Person jobReportsToPerson = new Person();
        jobReportsToPerson.setNetworkId(TEST_CHANGED_SUPERVISOR_NETWORKID);
        jobReportsToPerson.setUniversityId(TEST_CHANGED_SUPERVISOR_EMPLID);
        lenient().doReturn(jobReportsToPerson).when(personService).getPersonByUniversityId(TEST_CHANGED_SUPERVISOR_EMPLID);

        arrangementService.updateArrangementEndDateByInactiveAndOnChangedSupervisorStep(false);
        assertNull(arrangementDocument.getRemoteWorkEndDate(), "Supervise change feature not enabled, don't end this arrangement");
        verify(arrangementService, times(1)).logAndSetHelper(isA(LocalDate.class), isA(ArrangementDocument.class), isA(Person.class), eq(false), eq(true), eq(true), eq(false));
    }

    @Test
    public void testUpdateArrangementEndDateByInactiveStep_UNHANDLED_EXCEPTION() {
        ArrangementDocument arrangementDocument = getArrangementDocument1();
        List<ArrangementDocument> arrangements = List.of(arrangementDocument);
        doReturn(arrangements).when(arrangementDocumentRepository).findCompletedArrangementsWithNoOrFutureEndDate();

        RuntimeException runtimeExceptionCause = new RuntimeException("Unhandled");
        RuntimeException runtimeException = new RuntimeException(runtimeExceptionCause);
        doThrow(runtimeException).when(personService).getPersonByUniversityId(TEST_EMPLID);

        assertThrows(
                RuntimeException.class,
                () -> arrangementService.updateArrangementEndDateByInactiveAndOnChangedSupervisorStep(true),
                "PersonService threw unhandled exception which we didn't handle"
        );
    }

    private Person getPersonHelper(Job job) {
        Person person = new Person();
        person.setNetworkId("networkId");
        if (job == null) {
            person.setJobs(new ArrayList<>());
        } else {
            person.setJobs(List.of(job));
        }
        return person;
    }

    protected Job getTestJob1() {
        Job job = new Job(TEST_EMPLID, 0, "123456", "Hacker",
            "UA-VPIT", LocalDate.now(), "S12", IMS_JOB_FULL_TIME_INDICATOR, "");

        return job;
    }

    protected Job getTestJob2() {
        Job job = new Job(TEST_EMPLID, 0, "123457", "Slacker",
            "UA-VPIT", LocalDate.now(), "FOO", IMS_JOB_FULL_TIME_INDICATOR, "");

        return job;
    }

    protected Job getTestJob3() {
        Job job = new Job(TEST_EMPLID, 0, "123458", "Manager",
            "UA-VPIT", LocalDate.now(), "HRO", IMS_JOB_FULL_TIME_INDICATOR, "");

        return job;
    }

    protected ArrangementDocument getArrangementDocument1() {
        ArrangementDocument document1 = new ArrangementDocument();
        document1.setJob(getTestJob1());
        document1.setDocumentNumber("1");
        document1.setCreateUserId("network2");
        document1.setSupervisorReviewerId(TEST_SUPERVISOR_NETWORK_ID);
        document1.setRemoteWorkStartDate(LocalDate.now());
        document1.setCreateTimestamp(LocalDateTime.now().minusDays(1));
        document1.setCompletedTimestamp(LocalDateTime.now().minusDays(1));
        document1.setAttestationAcknowledged(true);
        ArrangementAdHoc adHoc = new ArrangementAdHoc("1", "foo", "foo", "comment");
        List<ArrangementAdHoc> adHocs = new ArrayList<>();
        adHocs.add(adHoc);
        document1.setArrangementAdHocs(adHocs);

        document1.setPersonService(personService);

        return document1;
    }

    protected AttestationText getAttestationText1() {
        AttestationText text = new AttestationText();
        text.setId(Long.valueOf(1));
        text.setText("Agree to all this stuff");

        return text;
    }

    protected WorkflowDocument getWorkflowDocument1() {
        WorkflowDocument workflowDocument = new WorkflowDocument();
        workflowDocument.setId("1");
        workflowDocument.setStatus("R");

        return workflowDocument;
    }

    protected Person getPerson() {
        Person person = new Person();
        person.setFirstName("Joe");
        person.setLastName("Garage");
        person.setEmailAddress("joe@email.com");

        person.setJobs(new ArrayList<>());

        return person;
    }

    protected Person getSupervisor() {
        Person person = new Person();
        person.setNetworkId(TEST_SUPERVISOR_NETWORK_ID);
        person.setUniversityId(TEST_SUPERVISOR_EMPLID);
        return person;
    }
}
