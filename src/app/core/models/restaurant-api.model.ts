/**
 * DTOs según Restaurant Management (CU-02) - Postman collection.
 */

export interface ScheduleDay {
  open?: string;
  close?: string;
  closed: boolean;
}

export interface RestaurantSchedule {
  monday?: ScheduleDay;
  tuesday?: ScheduleDay;
  wednesday?: ScheduleDay;
  thursday?: ScheduleDay;
  friday?: ScheduleDay;
  saturday?: ScheduleDay;
  sunday?: ScheduleDay;
}

export interface RestaurantCreateDto {
  name: string;
  description?: string;
  logo?: string;
  phone?: string;
  address?: string;
  schedule?: RestaurantSchedule;
}

export type RestaurantUpdateDto = RestaurantCreateDto;

export interface RestaurantResponseDto {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  phone?: string;
  address?: string;
  schedule?: RestaurantSchedule;
  slug?: string;
}
