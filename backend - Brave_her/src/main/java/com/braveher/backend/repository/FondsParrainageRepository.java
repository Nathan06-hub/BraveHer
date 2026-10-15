package com.braveher.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.braveher.backend.model.entity.FondsParrainage;

import java.util.UUID;

public interface FondsParrainageRepository extends JpaRepository<FondsParrainage, UUID> {
}
