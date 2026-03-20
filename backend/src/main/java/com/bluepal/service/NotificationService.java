package com.bluepal.service;

import com.bluepal.dto.response.NotificationResponse;
import com.bluepal.entity.Notification;
import com.bluepal.entity.NotificationType;
import com.bluepal.entity.User;
import com.bluepal.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository, SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public void createAndSendNotification(User recipient, User sender, NotificationType type, Long recipeId, String message) {
        // Don't notify yourself
        if (recipient.getId().equals(sender.getId())) {
            return;
        }

        Notification notification = Notification.builder()
                .recipient(recipient)
                .sender(sender)
                .type(type)
                .recipeId(recipeId)
                .message(message)
                .read(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        
        NotificationResponse response = mapToResponse(saved);
        
        // Send via WebSocket
        messagingTemplate.convertAndSendToUser(
                recipient.getUsername(),
                "/queue/notifications",
                response
        );
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .senderUsername(notification.getSender().getUsername())
                .senderUserId(notification.getSender().getId())
                .senderProfilePictureUrl(notification.getSender().getProfilePictureUrl())
                .type(notification.getType())
                .recipeId(notification.getRecipeId())
                .message(notification.getMessage())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
