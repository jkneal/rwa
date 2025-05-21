package edu.iu.es.ebs.rwa.repositories;

import edu.iu.es.ebs.rwa.domain.Country;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;

import java.util.List;

public interface CountryRepository extends PagingAndSortingRepository<Country, String>, CrudRepository<Country, String> {

    List<Country> findAll();

}
