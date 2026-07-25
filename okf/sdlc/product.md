---
type: Definition Layer
title: Product
short_title: Product
stage: product
order: 20
description: Define how the product solves the business problem and what outcomes and capabilities it promises.
tags: [sdlc, product, capabilities, outcomes]
status: active
sdlc: [product]
relationships:
  - type: informed-by
    target: /sdlc/business.md
  - type: supports
    target: /product/capabilities/product-definition.md
---

# Purpose

Translate business problems, users, and outcomes into a coherent product contract.

# Defines

- Product proposition and boundaries
- User outcomes and product capabilities
- Product behavior, policies, and requirements
- Success measures and acceptance outcomes
- Product assumptions, constraints, and risks
- Traceability from business needs to product responses

# Agent posture

Ask how the product creates the intended outcome, challenge features without business or persona traceability, clarify product boundaries, and avoid embedding design or implementation choices unless they are true constraints.

# Downstream influence

Product changes commonly affect Visual Design, System Design, Architecture, Application Architecture, Components, and Code Design. Internal realization changes remain downstream while the product contract holds.
