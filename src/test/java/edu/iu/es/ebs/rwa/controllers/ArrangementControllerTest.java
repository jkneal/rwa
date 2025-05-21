package edu.iu.es.ebs.rwa.controllers;

import edu.iu.es.ebs.rwa.domain.ArrangementDocument;
import edu.iu.es.ebs.rwa.service.ArrangementService;
import edu.iu.es.ebs.rwa.service.AuthorizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ArrangementControllerTest {
    public static final String DOCUMENT_NUMBER = "12345";

    @InjectMocks
    ArrangementController arrangementController;
    @Mock
    ArrangementService arrangementService;
    @Mock
    AuthorizationService authorizationService;

    @BeforeEach
    public void setup() {
        this.arrangementController = new ArrangementController();
        arrangementController.arrangementService = arrangementService;
        arrangementController.authorizationService = authorizationService;

        ArrangementDocument arrangementDocument = new ArrangementDocument();
        arrangementDocument.setDocumentNumber(DOCUMENT_NUMBER);
        when(arrangementService.getArrangement(DOCUMENT_NUMBER)).thenReturn(arrangementDocument);

        when(authorizationService.canViewArrangement(any(ArrangementDocument.class))).thenReturn(true);
    }

    @Test
    public void testGetArrangement() {
        assertEquals(DOCUMENT_NUMBER, arrangementController.getArrangement(DOCUMENT_NUMBER).getDocumentNumber());
    }
}
