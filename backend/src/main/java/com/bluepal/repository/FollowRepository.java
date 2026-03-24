package com.bluepal.repository;

import com.bluepal.entity.Follow;
import com.bluepal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    Optional<Follow> findByFollowerAndFollowing(User follower, User following);
    boolean existsByFollowerAndFollowing(User follower, User following);
    java.util.List<Follow> findByFollowing(User following);
    java.util.List<Follow> findByFollower(User follower);
    long countByFollower(User follower);
    long countByFollowing(User following);
}
