package com.bluepal.service;

import com.bluepal.entity.Notification;
import com.bluepal.entity.NotificationType;
import com.bluepal.entity.User;
import com.bluepal.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private NotificationService notificationService;

    private User sender;
    private User recipient;

    @BeforeEach
    void setUp() {
        sender = User.builder().id(1L).username("sender").build();
        recipient = User.builder().id(2L).username("recipient").build();
    }

    @Test
    void createAndSendNotification_Success() {
        Notification mockSaved = Notification.builder()
                .id(100L)
                .recipient(recipient)
                .sender(sender)
                .type(NotificationType.LIKE)
                .message("Liked your recipe")
                .build();
        
        when(notificationRepository.save(any(Notification.class))).thenReturn(mockSaved);

        notificationService.createAndSendNotification(recipient, sender, NotificationType.LIKE, 500L, "Liked your recipe");

        verify(notificationRepository).save(any(Notification.class));
        verify(messagingTemplate).convertAndSendToUser(eq("recipient"), eq("/queue/notifications"), any());
    }

    @Test
    void createAndSendNotification_SelfNotification_Ignore() {
        notificationService.createAndSendNotification(sender, sender, NotificationType.LIKE, 500L, "Liked own recipe");

        verifyNoInteractions(notificationRepository);
        verifyNoInteractions(messagingTemplate);
    }
}
