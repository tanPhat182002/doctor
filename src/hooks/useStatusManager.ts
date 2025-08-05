import { useMemo } from 'react'
import {
  getHealthStatusConfig,
  getExamStatusConfig,
  getAnimalTypeConfig,
  getHealthStatusOptions,
  getExamStatusOptions,
  getAnimalTypeOptions,
  isValidHealthStatus,
  isValidExamStatus,
  isValidAnimalType,
  STATUS_GROUPS
} from '@/lib/status-manager'
import type { HealthStatus, ExamStatus, AnimalType } from '@/types'

/**
 * Custom hook for managing status configurations
 * Provides easy access to status configs and validation functions
 */
export function useStatusManager() {
  const statusManager = useMemo(() => ({
    // Health Status
    health: {
      getConfig: getHealthStatusConfig,
      getOptions: getHealthStatusOptions,
      isValid: isValidHealthStatus,
      groups: STATUS_GROUPS.HEALTH
    },
    
    // Exam Status
    exam: {
      getConfig: getExamStatusConfig,
      getOptions: getExamStatusOptions,
      isValid: isValidExamStatus,
      groups: STATUS_GROUPS.EXAM
    },
    
    // Animal Type
    animal: {
      getConfig: getAnimalTypeConfig,
      getOptions: getAnimalTypeOptions,
      isValid: isValidAnimalType
    }
  }), [])

  return statusManager
}

/**
 * Hook for health status management
 */
export function useHealthStatus() {
  return useMemo(() => ({
    getConfig: getHealthStatusConfig,
    getOptions: getHealthStatusOptions,
    isValid: isValidHealthStatus,
    groups: STATUS_GROUPS.HEALTH
  }), [])
}

/**
 * Hook for exam status management
 */
export function useExamStatus() {
  return useMemo(() => ({
    getConfig: getExamStatusConfig,
    getOptions: getExamStatusOptions,
    isValid: isValidExamStatus,
    groups: STATUS_GROUPS.EXAM
  }), [])
}

/**
 * Hook for animal type management
 */
export function useAnimalType() {
  return useMemo(() => ({
    getConfig: getAnimalTypeConfig,
    getOptions: getAnimalTypeOptions,
    isValid: isValidAnimalType
  }), [])
}

/**
 * Hook for getting status display information
 */
export function useStatusDisplay() {
  return useMemo(() => ({
    /**
     * Get display info for health status
     */
    getHealthDisplay: (status: HealthStatus) => {
      const config = getHealthStatusConfig(status)
      return {
        label: config.label,
        emoji: config.emoji,
        className: config.className
      }
    },
    
    /**
     * Get display info for exam status
     */
    getExamDisplay: (status: ExamStatus) => {
      const config = getExamStatusConfig(status)
      return {
        label: config.label,
        emoji: config.emoji,
        className: config.className
      }
    },
    
    /**
     * Get display info for animal type
     */
    getAnimalDisplay: (type: AnimalType) => {
      const config = getAnimalTypeConfig(type)
      return {
        label: config.label,
        emoji: config.emoji
      }
    }
  }), [])
}