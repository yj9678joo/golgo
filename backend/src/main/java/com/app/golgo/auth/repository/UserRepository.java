package com.app.golgo.auth.repository;

import com.app.golgo.auth.entity.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {

	Optional<User> findByEmailAndDeletedAtIsNull(String email);

	Optional<User> findByLoginIdAndDeletedAtIsNull(String loginId);

	Optional<User> findByIdAndDeletedAtIsNull(UUID id);

	boolean existsByLoginIdAndDeletedAtIsNull(String loginId);

	boolean existsByEmailAndDeletedAtIsNull(String email);

	boolean existsByNicknameAndDeletedAtIsNull(String nickname);
}
