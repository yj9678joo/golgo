package com.app.golgo.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Clock;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

@Getter
@Entity
@Table(name = "users")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

	@Id
	@Generated(event = EventType.INSERT)
	@Column(insertable = false, updatable = false)
	private UUID id;

	@Column(name = "login_id", nullable = false, unique = true, length = 50)
	private String loginId;

	@Column(name = "password_hash", nullable = false)
	private String passwordHash;

	@Column(nullable = false, length = 50)
	private String name;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(nullable = false, unique = true, length = 12)
	private String nickname;

	@Column(name = "profile_image")
	private String profileImage;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	@Column(name = "deleted_at")
	private Instant deletedAt;

	private User(
		String loginId,
		String passwordHash,
		String name,
		String email,
		String nickname,
		String profileImage,
		Clock clock
	) {
		this.loginId = loginId;
		this.passwordHash = passwordHash;
		this.name = name;
		this.email = email;
		this.nickname = nickname;
		this.profileImage = profileImage;
		this.createdAt = Instant.now(clock);
		this.updatedAt = this.createdAt;
	}

	public static User create(String email, String nickname, String profileImage, Clock clock) {
		String fallbackLoginId = email.contains("@") ? email.substring(0, email.indexOf('@')) : email;
		return new User(fallbackLoginId, "", nickname, email, nickname, profileImage, clock);
	}

	public static User createLocal(
		String loginId,
		String passwordHash,
		String name,
		String email,
		String nickname,
		Clock clock
	) {
		return new User(loginId, passwordHash, name, email, nickname, null, clock);
	}

	public void changeNickname(String nickname, Clock clock) {
		this.nickname = nickname;
		this.updatedAt = Instant.now(clock);
	}

	public void delete(Clock clock) {
		this.deletedAt = Instant.now(clock);
		this.updatedAt = this.deletedAt;
	}

	public void assignIdForTest(UUID id) {
		this.id = id;
	}
}
