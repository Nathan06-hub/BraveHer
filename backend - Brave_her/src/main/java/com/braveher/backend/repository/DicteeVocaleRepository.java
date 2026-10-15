package com.braveher.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.braveher.backend.model.entity.DicteeVocale;

import java.util.UUID;

public interface DicteeVocaleRepository extends JpaRepository<DicteeVocale, UUID> {
}
