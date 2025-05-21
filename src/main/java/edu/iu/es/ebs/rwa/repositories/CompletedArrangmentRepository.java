package edu.iu.es.ebs.rwa.repositories;

import edu.iu.es.ebs.rwa.domain.CompletedArrangement;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CompletedArrangmentRepository extends
        PagingAndSortingRepository<CompletedArrangement, CompletedArrangement.CompletedArrangementId>,
        CrudRepository<CompletedArrangement, CompletedArrangement.CompletedArrangementId> {

    @Modifying
    @Query("delete from CompletedArrangement c WHERE c.lastUpdateDocumentNumber = :documentNumber")
    void deleteByDocumentNumber(@Param("documentNumber") String documentNumber);
}
