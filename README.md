# Remote Work Arrangement

If you have problems with this project try updating IntelliJ, maven and node.

This project does not have Front end mock data. Please plan to develop with the back end.

#### Front end watch w/ Back end ####

Upon importing this project into IntelliJ it should automatically recognize it as a Spring project and create a RwaApplication Spring Boot run configuration for you. This may take a few minutes, IntellJ should have a progress bar in the lower right for resolving artifacts. Edit it and add the following two Environment Variables:
`launchpad.env-code=dev;SPRING_PROFILES_ACTIVE=dev;SPRING_CLOUD_VAULT_TOKEN=[Go to Vault test -> Profile in upper right -> Copy token and put it here]`.
The token expires every day (12 hours). You will need to fetch a new one accordingly.
Update
If you want to run against a different environment, change launchpad.env-code and add SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_UAA_CLIENT-ID=rwa-dev,SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_UAA_CLIENT-SECRET=[managed/rwa/dev/oauth],APPLICATION_URL=http://localhost:8080

1.`rwa> npm install`. IntelliJ should download and resolve maven dependencies for you. If you have problems try one or both of the following, this should not be necessary every time...
   1. Right click on rwa in IntelliJ -> Maven -> Reload Project
   2. `rwa> mvn clean package`
2. `rwa> npm run start`
3. Start RwaApplication in IntelliJ
4. http://localhost:8080

#### Common Errors ###

* `org.springframework.web.client.UnknownContentTypeException: Could not extract response: no suitable HttpMessageConverter found for response type` usually on Integration Tests
Run OLTP app against dev profile and open the Arrangements search page (which populates Organization cache). Make sure this run is _without_ spring.redis.cache.prefix parameter.
* Permission error for your user on homepage
Either `mvn clean package` or `delete from completed_arrangement_t where emplid='<YOUR EMPLID>'; delete from arrangement_doc_t where emplid='<YOUR EMPLID'; commit;`

#### Batch jobs ####

If you want to run a batch job modify SPRING_PROFILES_ACTIVE. For example:
`SPRING_PROFILES_ACTIVE=dev,batch,send-review-arrangement-email-batch`

If you want to run a batch job on a branch only in kubernetes, do the following:
1. Copy of develop-branch.yml to develop-branch-FSKD-????.yml 
   1. Modify every (3) instance of "develop" and change it to your branch (feature/FSKD-????)
2. You can remove run-afts and deploying environments, it'll make things run faster
3. Push the branch and you should see your branch be executed by github actions (https://github.iu.edu/iu-uits-es/rwa/actions). Ignore the ephemeral run, you want to verify the development one
4. Now you can verify the logs in k9s (see KFS FAQ/Connecting to our nodes in Kubernetes)
   1. If you have a build error "UPGRADE FAILED: cannot patch ... field is immutable" then go into k9s -> :jobs -> delete the review-arngmnt pod (ctrl-d)
5. When you are done delete your worksflows in github actions (https://github.iu.edu/iu-uits-es/rwa/actions)

#### Running Automated Functional Tests ####

*Pre-requisites*
1. rwa-aft.properties is assumed to be in ~/properties/. Ask another developer if necessary
   * LF+CR are not supported in the properties file, if necessary strip them (cat file1 | sed 's/\r$//' > file2)
   * ensure that every CYPRESS_ line has a LF (newline) at the end
   * If needed can adjust the defaultWaitTime. Depending on your latency to campus we have found a value of 1000 or even 3000 works better
      * `CYPRESS_defaultWaitTime=3000`
2. If you are using Windows, you should create a rwa-aft.cmd file in your home directory with the properties copied from escbstst (see above). Prefix each line with "SET ". For example:
   * `SET CYPRESS_baseUrl=http://localhost:8080`
3. Be on the cas-loadtest VPN

*Steps*
1. Start RWA on localhost:8080. AFTs use real data
2. Run cypress
   * `rwa> npm run cy:run` to run all tests in a terminal
   * `rwa> npm run cy:open` to interact with the cypress UI

*Notes*
1. AFT tests can have dependencies on users in the test not having a current arrangement. Arrangements can be cleared using the following sql:
   * `delete from completed_arrangement_t where emplid=<EMPLID>`
   * `delete from arrangement_doc_t where emplid=<EMPLID>`
2. If you add a new AFT file, be sure to add it to app/cypress.json, under the `"testFiles": []` section, so that Cypress picks it up.

#### Auto restarting Back end on java changes ####

> At the time of writing the auto restarting is not fully supported yet. If you get the following stacktrace then it is not working yet `class edu.iu.es.ebs.rwa.domain.Person cannot be cast to class edu.iu.es.ebs.rwa.domain.Person`

Open Maven (on the right or View -> Tool Windows -> Maven) -> Profiles -> check "spring-dev". Simply "Build -> Build Project" in IntelliJ to have it auto restart. Refer to the library documentation for the scenarios this works for. You can also automate that, but most of us find this disruptive:
1. Preferences -> Build, Execution, Deployment -> Compiler -> check "Build project automatically"
2. Press command-shift-a (Windows: ctrl-shift-a) then type "registry" and click on it. Then enable the option "compiler.automake.allow.when.app.running"
3. Restart IntelliJ
