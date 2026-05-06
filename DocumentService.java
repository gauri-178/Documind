package com.documind.backend.service;

import com.documind.backend.dto.DocumentDto;
import com.documind.backend.entity.mysql.Document;
import com.documind.backend.repository.mysql.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class DocumentService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private AiIntelligenceService aiService;

    @Transactional
    public DocumentDto uploadDocument(MultipartFile file) throws IOException {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = "";
        
        int i = originalFileName.lastIndexOf('.');
        if (i > 0) {
            fileExtension = originalFileName.substring(i);
        }

        String storedFileName = UUID.randomUUID().toString() + fileExtension;
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(storedFileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        Document document = Document.builder()
                .name(originalFileName)
                .type(file.getContentType())
                .size(file.getSize())
                .storagePath(filePath.toString())
                .build();

        document = documentRepository.save(document);

        // Trigger AI processing (OCR, extraction, embedding)
        aiService.processDocument(document.getId(), filePath.toFile());

        return DocumentDto.builder()
                .id(document.getId())
                .name(document.getName())
                .type(document.getType())
                .size(document.getSize())
                .build();
    }

    @Transactional
    public void deleteDocument(Long id) throws IOException {
        Document document = documentRepository.findById(id).orElseThrow();
        Path filePath = Paths.get(document.getStoragePath());
        Files.deleteIfExists(filePath);
        documentRepository.delete(document);
    }
}
