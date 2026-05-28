package com.app.golgo.auth.repository;

import com.app.golgo.auth.entity.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {

	Optional<User> findByEmailAndDeletedAtIsNull(String email);

	Optional<User> findByIdAndDeletedAtIsNull(UUID id);

	boolean existsByNicknameAndDeletedAtIsNull(String nickname);
}
