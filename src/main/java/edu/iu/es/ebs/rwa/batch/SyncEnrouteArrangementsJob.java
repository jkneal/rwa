package edu.iu.es.ebs.rwa.batch;

import edu.iu.es.ebs.rwa.domain.ArrangementDocument;
import edu.iu.es.ebs.rwa.repositories.ArrangementDocumentRepository;
import edu.iu.es.ebs.rwa.service.SyncEnrouteArrangementService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Profile("sync-enroute-arrangements-batch")
public class SyncEnrouteArrangementsJob implements BatchJob {
    private final Log LOG = LogFactory.getLog(this.getClass());

    @Value("${uaa.url}/oauth/token")
    protected String tokenURL;

    @Value("${spring.security.oauth2.client.registration.uaa.client-id}")
    protected String clientId;

    @Value("${spring.security.oauth2.client.registration.uaa.client-secret}")
    protected String clientSecret;

    @Value("${uaa.rwa.system.username}")
    protected String systemUsername;

    @Value("${uaa.rwa.system.password}")
    protected String systemPassword;

    @Value("${sync.older.one.year.enroute.arrangements.enabled:true}")
    private Boolean syncOlderOneYearEnrouteArrangementsEnabled;

    @Value("${sync.inactive.data.enroute.arrangements.enabled:true}")
    private Boolean syncInactiveDataEnrouteArrangementsEnabled;

    @Autowired
    private ArrangementDocumentRepository arrangementDocumentRepository;

    @Autowired
    private SyncEnrouteArrangementService syncEnrouteArrangementService;

    @Override
    public void run() {
        LOG.info("Started job sync-enroute-arrangements-batch on date " + LocalDateTime.now()
                + " syncOlderOneYearEnrouteArrangementsEnabled=" + syncOlderOneYearEnrouteArrangementsEnabled
                + " syncInactiveDataEnrouteArrangementsEnabled=" + syncInactiveDataEnrouteArrangementsEnabled);

        List<ArrangementDocument> arrangementsToSync = arrangementDocumentRepository.findEnrouteArrangementsOlderThan(LocalDateTime.now().minusYears(1));
        LOG.info("Step 1: Found " + arrangementsToSync.size() + " arrangements eligible for sync");
        syncEnrouteArrangementService.sync(arrangementsToSync, syncOlderOneYearEnrouteArrangementsEnabled);

        List<ArrangementDocument> arrangementsToReview = arrangementDocumentRepository.findEnrouteArrangementsBetween(LocalDateTime.now().minusYears(1), LocalDateTime.now().minusWeeks(1));
        LOG.info("Step 2: Found " + arrangementsToReview.size() + " arrangements eligible for sync review");
        syncEnrouteArrangementService.reviewAndSync(arrangementsToReview, syncInactiveDataEnrouteArrangementsEnabled);
    }
}
