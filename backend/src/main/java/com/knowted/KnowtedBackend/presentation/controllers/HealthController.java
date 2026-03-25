package com.knowted.KnowtedBackend.presentation.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@SuppressWarnings("unused")
public class HealthController {

    @GetMapping("/health")
    public String ping() {
        return "backend is up";
    }
}