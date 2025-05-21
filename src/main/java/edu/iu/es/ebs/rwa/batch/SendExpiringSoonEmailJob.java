package edu.iu.es.ebs.rwa.batch;

import edu.iu.es.ebs.rwa.RwaConstants;
import edu.iu.es.ebs.rwa.domain.ArrangementDocument;
import edu.iu.es.ebs.rwa.domain.Job;
import edu.iu.es.ebs.rwa.domain.Person;
import edu.iu.es.ebs.rwa.repositories.ArrangementDocumentRepository;
import edu.iu.es.ebs.rwa.service.ArrangementService;
import edu.iu.es.ebs.rwa.service.PersonService;
import edu.iu.es.ep.launchpad.notifications.domain.Notification;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

import static edu.iu.es.ebs.rwa.RwaConstants.EXPIRING_NOTIFICATION_TEXT;

@Component
@Profile("send-expiring-soon-email-batch")
public class SendExpiringSoonEmailJob implements BatchJob {

    @Autowired
    private ArrangementDocumentRepository arrangementDocumentRepository;

    @Autowired
    private ArrangementService arrangementService;

    @Autowired
    private PersonService personService;

    @Value("${application.url}")
    private String rwaUrl;

    private static final Log LOG = LogFactory.getLog(SendExpiringSoonEmailJob.class);

    @Override
    public void run() {
        LOG.info("Started job send-expiring-soon-email-batch on date " + LocalDateTime.now());

        List<ArrangementDocument> arrangements = arrangementDocumentRepository.findArrangementsExpiringSoon();
        LOG.info("Found " + arrangements.size() + " arrangements expiring soon");

        for (ArrangementDocument arrangement : arrangements) {
            Job job = arrangement.getJob();

            String createUserId = arrangement.getCreateUserId();

            Person employee = null;
            try {
                employee = personService.getPersonByNetworkId(createUserId);
            } catch (Exception e) {
                LOG.error("Encountered error while fetching Person details for network id " + createUserId);
            }

            if (employee == null) {
                continue;
            }

            if (employee.isEmployee()) {
                LOG.info("Sending emails for RWA with Empl id " + job.getEmplid() + ", Job Position Number " + job.getJobPositionNumber() + ", Job Record Number " + job.getJobRecordNumber());

                try {
                    LOG.info("Sending email to " + employee.getNetworkId());
                    arrangementService.sendNotification(arrangement, String.format(EXPIRING_NOTIFICATION_TEXT, employee.getFirstName() + " " + employee.getLastName(), job.getJobTitle()), RwaConstants.NotificationType.EXPIRING_SOON, RwaConstants.NotificationTitle.EXPIRING_SOON, Notification.Priority.NORMAL, getPrimaryActionURL(arrangement), employee.getNetworkId());
                    LOG.info("Sending email to " + arrangement.getSupervisor().get("networkId"));
                    arrangementService.sendNotification(arrangement, String.format(EXPIRING_NOTIFICATION_TEXT, employee.getFirstName() + " " + employee.getLastName(), job.getJobTitle()), RwaConstants.NotificationType.EXPIRING_SOON, RwaConstants.NotificationTitle.EXPIRING_SOON, Notification.Priority.NORMAL, getPrimaryActionURL(arrangement), arrangement.getSupervisor().get("networkId"));
                } catch (Exception e) {
                    LOG.error("Encountered error sending emails for RWA with Empl id " + job.getEmplid() + ", Job Position Number " + job.getJobPositionNumber() + ", Job Record Number " + job.getJobRecordNumber(), e);
                }
            } else {
                LOG.info("Not sending emails for RWA with Empl id " + job.getEmplid() + ", Job Position Number " + job.getJobPositionNumber() + ", Job Record Number " + job.getJobRecordNumber() + ", since employee is not active");
            }
        }
    }

    private String getPrimaryActionURL(ArrangementDocument doc) {
        return rwaUrl + "/arrangement/review/" + doc.getDocumentNumber();
    }

}
