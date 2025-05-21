package edu.iu.es.ebs.rwa.repositories;

import edu.iu.es.ebs.rwa.domain.AttestationText;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttestationTextRepository extends PagingAndSortingRepository<AttestationText, Long>, CrudRepository<AttestationText, Long> {

    @Query("SELECT t FROM AttestationText t WHERE t.effectiveDate = (select max(effectiveDate) from AttestationText " +
        " where effectiveDate <= :asOfDate)")
    AttestationText getCurrent(@Param("asOfDate") LocalDate asOfDate);

    @Query("SELECT t FROM AttestationText t WHERE t.effectiveDate > :asOfDate order by t.effectiveDate")
    List<AttestationText> getFuture(@Param("asOfDate") LocalDate asOfDate);

    @Query("SELECT t FROM AttestationText t WHERE t.effectiveDate = :effectiveDate")
    AttestationText getByEffectiveDate(@Param("effectiveDate") LocalDate effectiveDate);

}
