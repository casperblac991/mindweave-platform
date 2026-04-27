---
name: platform-optimizer
description: A comprehensive skill for analyzing and optimizing digital platforms, focusing on product expansion, content strategy, social media promotion, and technical/design improvements to boost conversion rates and global reach. Use when a user wants to analyze a website or digital platform and develop a growth strategy.
---

# Platform Optimizer Skill

This skill provides a structured workflow to analyze an existing digital platform and develop a comprehensive strategy for its improvement and scaling. It addresses common challenges such as lack of customers, insufficient product offerings, outdated content, and ineffective marketing.

## Workflow

The optimization process is now **automated**. Follow these steps using the provided scripts:

1.  **Automated Platform Analysis**:
    *   **Action**: Run `scripts/analyze_platform.py <url>` to extract technical data.
    *   **Action**: Run `scripts/generate_report.py 1_platform_analysis_template.md <output_path> "اسم المنصة=<name>"` to create the initial report.

2.  **Product Expansion Strategy**:
    *   **Action**: Run `scripts/generate_report.py 2_product_expansion_template.md <output_path> "اسم المنصة=<name>"` and then enrich it with AI-generated ideas.

3.  **Content & SEO Strategy**:
    *   **Action**: Run `scripts/generate_report.py 3_content_strategy_template.md <output_path> "اسم المنصة=<name>"` to generate the SEO framework.

4.  **Social Media Promotion Strategy**:
    *   **Action**: Run `scripts/generate_report.py 4_social_media_strategy_template.md <output_path> "اسم المنصة=<name>"` to create the social plan.

5.  **Conversion Rate Optimization (CRO) Strategy**:
    *   **Action**: Run `scripts/generate_report.py 5_platform_improvements_template.md <output_path> "اسم المنصة=<name>"` to generate the improvement plan.

## Usage

To initiate the process, confirm the user's goal to analyze and improve a digital platform. Then, follow the workflow step-by-step, informing the user as you complete each stage and delivering the corresponding document.

**Example User Request:** "I have a website, mindweave.store, but I'm not getting any customers. Can you help me fix it and make it a global success?"

Begin with Step 1 and proceed sequentially through the other steps, using the provided templates to create the deliverables.
