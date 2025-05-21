package edu.iu.es.ebs.rwa.service;

import edu.iu.es.ebs.rwa.domain.ArrangementDocument;
import edu.iu.es.ebs.rwa.domain.Job;

public interface AuthorizationService {

    boolean isAdmin();

    boolean isReviewer();

    boolean isBackdoorAllowed();

    boolean isImpersonating();

    boolean isPrd();

    boolean canCreateArrangement(Job job);

    boolean canViewArrangement(String documentNumber);

    boolean canViewArrangement(ArrangementDocument arrangementDocument);

}
