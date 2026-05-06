package com.documind.backend.repository.mysql;

import com.documind.backend.entity.mysql.Chat;
import com.documind.backend.entity.mysql.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChatOrderByTimestampAsc(Chat chat);
}
