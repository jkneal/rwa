package edu.iu.es.ebs.rwa.repositories;

import edu.iu.es.ebs.rwa.domain.State;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;

import java.util.List;

public interface StateRepository extends PagingAndSortingRepository<State, String>, CrudRepository<State, String> {

    List<State> findAll();
}
