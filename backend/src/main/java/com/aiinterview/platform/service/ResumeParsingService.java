package com.aiinterview.platform.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ResumeParsingService {

    private static final Logger logger = LoggerFactory.getLogger(ResumeParsingService.class);

    private static final List<String> TECH_KEYWORDS = Arrays.asList(
            "java", "spring boot", "spring", "python", "javascript", "typescript", "react", "angular",
            "vue", "node.js", "express", "c++", "c#", ".net", "sql", "mysql", "postgresql",
            "mongodb", "redis", "docker", "kubernetes", "aws", "azure", "gcp", "git",
            "rest api", "graphql", "microservices", "html", "css", "tailwind", "data structures",
            "algorithms", "system design", "machine learning", "deep learning", "nlp", "kafka",
            "ci/cd", "linux", "agile", "junit", "hibernate", "flask", "django", "fastapi"
    );

    public record ParsedResume(
            String rawText,
            List<String> skills,
            List<String> projects,
            List<String> experience,
            String suggestedSummary
    ) {}

    /**
     * Extract plain text from PDF or raw bytes
     */
    public String extractTextFromPdf(byte[] bytes) {
        try (PDDocument document = Loader.loadPDF(bytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (Exception e) {
            logger.warn("PDF extraction failed or file is plain text, falling back to string decoding: {}", e.getMessage());
            return new String(bytes, StandardCharsets.UTF_8);
        }
    }

    /**
     * Deep parse resume to extract skills, projects, and experiences
     */
    public ParsedResume parseResume(String resumeText) {
        if (resumeText == null || resumeText.isBlank()) {
            return new ParsedResume(
                    "",
                    List.of("Software Engineering", "Problem Solving", "Object-Oriented Programming"),
                    List.of("Academic Capstone Project"),
                    List.of("College Practical Training"),
                    "Candidate is preparing for entry-level engineering placements."
            );
        }

        List<String> skills = extractSkills(resumeText);
        List<String> projects = extractProjects(resumeText);
        List<String> experience = extractExperience(resumeText);

        String summary = String.format("Candidate profile with strengths in %s. Highlighted %d projects and %d experience items.",
                String.join(", ", skills.stream().limit(4).toList()),
                projects.size(),
                experience.size());

        return new ParsedResume(resumeText, skills, projects, experience, summary);
    }

    public List<String> extractSkills(String resumeText) {
        if (resumeText == null || resumeText.isBlank()) {
            return List.of("General Software Engineering", "Problem Solving", "Object-Oriented Programming");
        }
        Set<String> matched = new LinkedHashSet<>();
        String lower = resumeText.toLowerCase();

        for (String skill : TECH_KEYWORDS) {
            String patternString = "\\b" + Pattern.quote(skill) + "\\b";
            Pattern pattern = Pattern.compile(patternString);
            Matcher matcher = pattern.matcher(lower);
            if (matcher.find()) {
                matched.add(capitalize(skill));
            }
        }

        if (matched.isEmpty()) {
            return List.of("Software Development", "Communication", "Team Collaboration");
        }
        return new ArrayList<>(matched);
    }

    public List<String> extractProjects(String resumeText) {
        List<String> projects = new ArrayList<>();
        if (resumeText == null || resumeText.isBlank()) return projects;

        String[] lines = resumeText.split("\\r?\\n");
        boolean inProjectSection = false;

        for (String rawLine : lines) {
            String line = rawLine.trim();
            if (line.isEmpty()) continue;

            String lower = line.toLowerCase();
            if (lower.contains("project") || lower.contains("academic project") || lower.contains("personal project") || lower.contains("key projects")) {
                inProjectSection = true;
                continue;
            }

            if (inProjectSection && (lower.startsWith("education") || lower.startsWith("experience") || lower.startsWith("certifications") || lower.startsWith("skills"))) {
                inProjectSection = false;
            }

            if (inProjectSection) {
                // If it looks like a project title (short line, bullet, or contains technologies)
                if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*") || line.length() < 70) {
                    String clean = line.replaceAll("^[•\\-*\\d.]+\\s*", "");
                    if (clean.length() > 5 && clean.length() < 90) {
                        projects.add(clean);
                    }
                }
            }
        }

        // If no explicit section header found, search for common project patterns
        if (projects.isEmpty()) {
            Pattern p = Pattern.compile("(?i)(e-commerce|chat application|portal|clone|tracker|dashboard|management system|ai|machine learning|full[- ]stack)[^\\n.]+");
            Matcher m = p.matcher(resumeText);
            while (m.find() && projects.size() < 4) {
                projects.add(m.group().trim());
            }
        }

        return projects.stream().distinct().limit(5).toList();
    }

    public List<String> extractExperience(String resumeText) {
        List<String> exp = new ArrayList<>();
        if (resumeText == null || resumeText.isBlank()) return exp;

        String[] lines = resumeText.split("\\r?\\n");
        boolean inExp = false;

        for (String rawLine : lines) {
            String line = rawLine.trim();
            if (line.isEmpty()) continue;

            String lower = line.toLowerCase();
            if (lower.contains("experience") || lower.contains("internship") || lower.contains("work history")) {
                inExp = true;
                continue;
            }

            if (inExp && (lower.startsWith("education") || lower.startsWith("projects") || lower.startsWith("skills"))) {
                inExp = false;
            }

            if (inExp && (line.startsWith("•") || line.startsWith("-") || line.length() < 80)) {
                String clean = line.replaceAll("^[•\\-*\\d.]+\\s*", "");
                if (clean.length() > 6) {
                    exp.add(clean);
                }
            }
        }

        return exp.stream().distinct().limit(4).toList();
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        String[] parts = str.split(" ");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (part.length() > 0) {
                sb.append(Character.toUpperCase(part.charAt(0))).append(part.substring(1)).append(" ");
            }
        }
        return sb.toString().trim();
    }
}
