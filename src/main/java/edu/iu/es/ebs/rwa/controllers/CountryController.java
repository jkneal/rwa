package edu.iu.es.ebs.rwa.controllers;

import edu.iu.es.ebs.rwa.domain.Country;
import edu.iu.es.ebs.rwa.repositories.CountryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/countries")
public class CountryController {

    @Autowired
    private CountryRepository countryRepository;

    @GetMapping("/")
    public List<Country> getCountries() {
        return countryRepository.findAll().stream().sorted(Comparator.comparing(Country::getPostalCountryName)).collect(Collectors.toList());
    }

}
