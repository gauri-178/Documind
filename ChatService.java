package com.documind.backend.service;

import com.documind.backend.dto.ChatDto;
import com.documind.backend.dto.DocumentDto;
import com.documind.backend.dto.MessageDto;
import com.documind.backend.entity.mysql.Chat;
import com.documind.backend.entity.mysql.Document;
import com.documind.backend.entity.mysql.Message;
import com.documind.backend.entity.mysql.User;
import com.documind.backend.repository.mysql.ChatRepository;
import com.documind.backend.repository.mysql.DocumentRepository;
import com.documind.backend.repository.mysql.MessageRepository;
import com.documind.backend.repository.mysql.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private AiIntelligenceService aiService;

    public List<ChatDto> getUserChats(String email) {
        User user = userRepository.findByEmail(email).get();
        return chatRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(chat -> ChatDto.builder()
                        .id(chat.getId())
                        .title(chat.getTitle())
                        .messageCount(chat.getMessageCount())
                        .createdAt(chat.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatDto createChat(String email, String initialTitle) {
        User user = userRepository.findByEmail(email).get();
        Chat chat = Chat.builder()
                .title(initialTitle != null ? initialTitle : "New Chat")
                .user(user)
                .messageCount(0)
                .build();
        chat = chatRepository.save(chat);
        return ChatDto.builder()
                .id(chat.getId())
                .title(chat.getTitle())
                .messageCount(0)
                .createdAt(chat.getCreatedAt())
                .build();
    }

    public List<MessageDto> getChatMessages(Long chatId) {
        Chat chat = chatRepository.findById(chatId).orElseThrow();
        return messageRepository.findByChatOrderByTimestampAsc(chat).stream()
                .map(this::mapToMessageDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageDto sendMessage(String email, Long chatId, String text, List<Long> documentIds) {
        Chat chat = chatRepository.findById(chatId).orElseThrow();
        
        // 1. Save User Message
        List<Document> docs = documentRepository.findAllById(documentIds);
        Message userMessage = Message.builder()
                .chat(chat)
                .role("user")
                .text(text)
                .documents(docs)
                .build();
        messageRepository.save(userMessage);

        // Update chat metadata
        chat.setMessageCount((chat.getMessageCount() != null ? chat.getMessageCount() : 0) + 1);
        chatRepository.save(chat);

        // 2. Get AI Context (RAG Placeholder)
        String context = aiService.getRelevantContext(text, 3);

        // 3. Generate AI Response
        String aiResponseText = aiService.generateResponse(text, context);
        
        // 4. Save AI Message
        Message aiMessage = Message.builder()
                .chat(chat)
                .role("assistant")
                .text(aiResponseText)
                .build();
        messageRepository.save(aiMessage);
        
        chat.setMessageCount(chat.getMessageCount() + 1);
        chatRepository.save(chat);

        return mapToMessageDto(aiMessage);
    }

    @Transactional
    public void deleteChat(Long chatId) {
        chatRepository.deleteById(chatId);
    }

    private MessageDto mapToMessageDto(Message msg) {
        return MessageDto.builder()
                .id(msg.getId())
                .role(msg.getRole())
                .text(msg.getText())
                .timestamp(msg.getTimestamp())
                .documents(msg.getDocuments() == null ? new java.util.ArrayList<>() : msg.getDocuments().stream()
                        .map(d -> DocumentDto.builder()
                                .id(d.getId())
                                .name(d.getName())
                                .type(d.getType())
                                .size(d.getSize())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
