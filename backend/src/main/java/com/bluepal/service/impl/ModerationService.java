package com.bluepal.service.impl;

import com.bluepal.entity.Report;
import com.bluepal.entity.User;
import com.bluepal.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ModerationService {

    private final ReportRepository reportRepository;

    public void reportContent(User reporter, String reason, String targetType, Long targetId) {
        Report report = Report.builder()
                .reporter(reporter)
                .reason(reason)
                .targetType(targetType)
                .targetId(targetId)
                .build();
        reportRepository.save(report);
    }

    public List<Report> getPendingReports() {
        return reportRepository.findByResolvedFalseOrderByCreatedAtDesc();
    }

    @Transactional
    public void resolveReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setResolved(true);
        reportRepository.save(report);
    }
}
