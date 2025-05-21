package edu.iu.es.ebs.rwa.repositories;

import edu.iu.es.ebs.rwa.domain.PostalCode;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostalCodeRepository extends PagingAndSortingRepository<PostalCode, String>, CrudRepository<PostalCode, String> {
    @Query("select p from PostalCode p where lower(p.postalCode) like %:search%")
    List<PostalCode> findPostalCode(@Param("search") String search);
}
