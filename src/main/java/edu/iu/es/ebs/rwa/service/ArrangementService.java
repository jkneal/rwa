package edu.iu.es.ebs.rwa.service;

import edu.iu.es.ebs.rwa.domain.*;
import edu.iu.es.ep.launchpad.notifications.domain.Notification;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ArrangementService {

    ArrangementDocument createArrangement(Job job, String networkId);

    ArrangementDocument getArrangement(String documentNumber);

    List<WorkflowAction> getActionsTaken(String documentNumber);

    ArrangementDocument updateArrangement(String documentNumber, String networkId);

    ArrangementDocument route(ArrangementDocument document);

    ArrangementDocument approve(ArrangementDocument document, String networkId);

    ArrangementDocument pushback(ArrangementDocument document, String networkId);

    ArrangementDocument disapprove(ArrangementDocument document);

    ArrangementDocument save(ArrangementDocument document);

    ArrangementDocument acknowledge(String documentNumber);

    void updateArrangementStatus(String documentNumber, String newStatus);

    void completeArrangement(String documentNumber, String newStatus);

    void sendNotification(ArrangementDocument doc, String text, String notificationType, String notificationTitle, Notification.Priority notificationPriority, String primaryActionURL, String recipient);

    List<JobArrangementStatus> getJobArrangementStatuses(String networkId);

    void deleteArrangement(String documentNumber);

    List<AdminArrangementDto> getArrangements(Map<String, Object> searchParameters);

    void updateArrangementEndDateByInactiveAndOnChangedSupervisorStep(boolean supervisorChangedReviewEnabled);

    List<ArrangementDocument> getOldArrangements(String networkId);

    List<String> inactivate(List<String> documentNumbers, LocalDate newEndDate);
}
