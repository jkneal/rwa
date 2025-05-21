package edu.iu.es.ebs.rwa.service;

import edu.iu.es.ebs.rwa.domain.ArrangementDocument;

import java.util.List;

public interface SyncEnrouteArrangementService {

    void sync(List<ArrangementDocument> arrangementsToCancel, Boolean syncOlderOneYearEnrouteArrangementsEnabled);

    void reviewAndSync(List<ArrangementDocument> arrangementsToCancel, Boolean syncInactiveDataEnrouteArrangementsEnabled);
}
