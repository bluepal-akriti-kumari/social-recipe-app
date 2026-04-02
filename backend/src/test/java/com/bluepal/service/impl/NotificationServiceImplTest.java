package com.bluepal.service.impl;

import com.bluepal.dto.response.NotificationResponse;
import com.bluepal.entity.Notification;
import com.bluepal.entity.User;
import com.bluepal.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setUsername("testuser");
    }

    @Test
    void getNotifications_Success() {
        when(notificationRepository.findByRecipientOrderByCreatedAtDesc(any(), any()))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        Page<NotificationResponse> response = notificationService.getNotifications(mockUser, PageRequest.of(0, 10));
        assertNotNull(response);
        assertTrue(response.getContent().isEmpty());
    }

    @Test
    void getUnreadCount_Success() {
        when(notificationRepository.countByRecipientAndRead(mockUser, false)).thenReturn(5L);

        long count = notificationService.getUnreadCount(mockUser);
        assertEquals(5L, count);
    }

    @Test
    void markAsRead_Success() {
        Notification notification = new Notification();
        notification.setId(1L);
        notification.setRecipient(mockUser);
        notification.setRead(false);

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));

        notificationService.markAsRead(1L, "testuser");

        assertTrue(notification.isRead());
        verify(notificationRepository).save(notification);
    }

    @Test
    void markAllAsRead_Success() {
        Notification notification = new Notification();
        notification.setRead(false);
        List<Notification> unread = List.of(notification);

        when(notificationRepository.findByRecipientAndReadOrderByCreatedAtDesc(mockUser, false)).thenReturn(unread);

        notificationService.markAllAsRead(mockUser);

        assertTrue(notification.isRead());
        verify(notificationRepository).saveAll(unread);
    }
}
