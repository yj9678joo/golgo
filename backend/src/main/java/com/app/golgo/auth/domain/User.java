package com.app.golgo.auth.domain;

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

	private User(String email, String nickname, String profileImage, Clock clock) {
		this.email = email;
		this.nickname = nickname;
		this.profileImage = profileImage;
		this.createdAt = Instant.now(clock);
		this.updatedAt = this.createdAt;
	}

	public static User create(String email, String nickname, String profileImage, Clock clock) {
		return new User(email, nickname, profileImage, clock);
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
