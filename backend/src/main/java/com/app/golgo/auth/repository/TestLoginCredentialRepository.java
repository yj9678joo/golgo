package com.app.golgo.auth.repository;

import com.app.golgo.auth.entity.TestLoginCredential;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestLoginCredentialRepository extends JpaRepository<TestLoginCredential, String> {

	Optional<TestLoginCredential> findByLoginId(String loginId);
}
