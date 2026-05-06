package com.documind.backend.controller;

import com.documind.backend.dto.ChatDto;
import com.documind.backend.dto.MessageDto;
import com.documind.backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @GetMapping
    public ResponseEntity<List<ChatDto>> getChats(Authentication authentication) {
        return ResponseEntity.ok(chatService.getUserChats(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<ChatDto> createChat(Authentication authentication, @RequestBody(required = false) Map<String, String> body) {
        String title = body != null ? body.get("title") : null;
        return ResponseEntity.ok(chatService.createChat(authentication.getName(), title));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<MessageDto>> getMessages(@PathVariable Long id) {
        return ResponseEntity.ok(chatService.getChatMessages(id));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<MessageDto> sendMessage(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        
        String text = (String) payload.get("text");
        List<Integer> docIdsRaw = (List<Integer>) payload.get("documentIds");
        List<Long> documentIds = docIdsRaw != null ? docIdsRaw.stream().map(Integer::longValue).toList() : List.of();

        return ResponseEntity.ok(chatService.sendMessage(authentication.getName(), id, text, documentIds));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteChat(@PathVariable Long id) {
        chatService.deleteChat(id);
        return ResponseEntity.ok().build();
    }
}
