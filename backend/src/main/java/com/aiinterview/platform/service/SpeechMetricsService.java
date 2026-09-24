package com.aiinterview.platform.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SpeechMetricsService {

    private static final List<String> FILLER_PATTERNS = Arrays.asList(
            "\\bum\\b", "\\buh\\b", "\\buhm\\b", "\\blike\\b", "\\bbasically\\b",
            "\\byou know\\b", "\\bactually\\b", "\\bsort of\\b", "\\bkind of\\b",
            "\\bi mean\\b", "\\bso yeah\\b", "\\bright\\b"
    );

    public int countFillerWords(String text) {
        if (text == null || text.isBlank()) {
            return 0;
        }
        int total = 0;
        String lower = text.toLowerCase();
        for (String regex : FILLER_PATTERNS) {
            Pattern pattern = Pattern.compile(regex);
            Matcher matcher = pattern.matcher(lower);
            while (matcher.find()) {
                total++;
            }
        }
        return total;
    }

    public int calculateWpm(String text, Integer durationSeconds) {
        if (text == null || durationSeconds == null || durationSeconds <= 0) {
            return 0;
        }
        String[] words = text.trim().split("\\s+");
        int wordCount = words.length;
        if (wordCount == 0 || (wordCount == 1 && words[0].isBlank())) {
            return 0;
        }
        double minutes = durationSeconds / 60.0;
        return (int) Math.round(wordCount / minutes);
    }

    public double calculateCommunicationScore(int wpm, int fillerCount, int wordCount) {
        // Base score: 85
        double score = 85.0;

        // Ideal WPM: 120 - 160
        if (wpm > 0) {
            if (wpm < 90) {
                score -= Math.min(15, (90 - wpm) * 0.4); // Too slow
            } else if (wpm > 180) {
                score -= Math.min(15, (wpm - 180) * 0.4); // Too rushed
            } else if (wpm >= 120 && wpm <= 160) {
                score += 5.0; // Sweet spot bonus
            }
        }

        // Filler word penalty
        if (wordCount > 0) {
            double fillerRatio = (double) fillerCount / wordCount;
            if (fillerRatio > 0.08) {
                score -= Math.min(25, (fillerRatio - 0.08) * 100);
            } else if (fillerRatio == 0 && wordCount > 20) {
                score += 5.0; // Very clean bonus
            }
        }

        return Math.max(20.0, Math.min(100.0, score));
    }
}
