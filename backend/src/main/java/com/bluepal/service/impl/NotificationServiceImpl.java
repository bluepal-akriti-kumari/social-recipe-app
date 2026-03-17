package com.bluepal.service.impl;

import com.bluepal.dto.response.NotificationResponse;
import com.bluepal.entity.Notification;
import com.bluepal.entity.User;
import com.bluepal.exception.ResourceNotFoundException;
import com.bluepal.repository.NotificationRepository;
import com.bluepal.service.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(User user, Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(user, pageable);
        return notifications.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countByRecipientAndRead(user, false);
    }

    @Override
    @Transactional
    public void markAsRead(Long id, String username) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));

        if (!notification.getRecipient().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByRecipientAndReadOrderByCreatedAtDesc(user, false);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .senderUsername(notification.getSender().getUsername())
                .senderProfilePictureUrl(notification.getSender().getProfilePictureUrl())
                .type(notification.getType())
                .recipeId(notification.getRecipeId())
                .message(notification.getMessage())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
