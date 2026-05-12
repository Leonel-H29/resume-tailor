// Infrastructure: PDF Generator
// Generates clean, ATS-friendly PDF from OptimizedResume entity using pdf-lib

import {
  PDFDocument,
  rgb,
  StandardFonts,
  type PDFFont,
  type PDFPage,
} from 'pdf-lib';
import type { OptimizedResume } from '@/domain/entities/OptimizedResume';

const COLORS = {
  black: rgb(0.08, 0.08, 0.08),
  darkGray: rgb(0.2, 0.2, 0.2),
  mediumGray: rgb(0.45, 0.45, 0.45),
  lightGray: rgb(0.85, 0.85, 0.85),
  accent: rgb(0.15, 0.3, 0.55), // Professional dark blue
  white: rgb(1, 1, 1),
};

const LAYOUT = {
  marginLeft: 50,
  marginRight: 50,
  marginTop: 50,
  marginBottom: 50,
  pageWidth: 612, // US Letter
  pageHeight: 792,
};

const FONTS = {
  nameSize: 22,
  sectionTitleSize: 11,
  jobTitleSize: 10.5,
  bodySize: 10,
  contactSize: 9.5,
};

interface DrawContext {
  page: PDFPage;
  boldFont: PDFFont;
  regularFont: PDFFont;
  y: number;
  pdfDoc: PDFDocument;
  pages: PDFPage[];
}

function getContentWidth(): number {
  return LAYOUT.pageWidth - LAYOUT.marginLeft - LAYOUT.marginRight;
}

function ensureSpace(ctx: DrawContext, needed: number): DrawContext {
  if (ctx.y - needed < LAYOUT.marginBottom) {
    const newPage = ctx.pdfDoc.addPage([LAYOUT.pageWidth, LAYOUT.pageHeight]);
    ctx.pages.push(newPage);
    return { ...ctx, page: newPage, y: LAYOUT.pageHeight - LAYOUT.marginTop };
  }
  return ctx;
}

function drawText(
  ctx: DrawContext,
  text: string,
  x: number,
  fontSize: number,
  font: PDFFont,
  color = COLORS.black,
  maxWidth?: number
): DrawContext {
  if (!text) return ctx;

  const availableWidth =
    maxWidth ?? getContentWidth() - (x - LAYOUT.marginLeft);
  const words = text.split(' ');
  let line = '';
  let currentCtx = ctx;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth > availableWidth && line) {
      currentCtx = ensureSpace(currentCtx, fontSize + 2);
      currentCtx.page.drawText(line, {
        x,
        y: currentCtx.y,
        size: fontSize,
        font,
        color,
      });
      currentCtx = { ...currentCtx, y: currentCtx.y - fontSize - 3 };
      line = word;
    } else {
      line = testLine;
    }
  }

  if (line) {
    currentCtx = ensureSpace(currentCtx, fontSize + 2);
    currentCtx.page.drawText(line, {
      x,
      y: currentCtx.y,
      size: fontSize,
      font,
      color,
    });
    currentCtx = { ...currentCtx, y: currentCtx.y - fontSize - 3 };
  }

  return currentCtx;
}

function drawSectionDivider(ctx: DrawContext, label: string): DrawContext {
  let c = ensureSpace(ctx, 20);
  c = { ...c, y: c.y - 6 };

  // Section title
  c.page.drawText(label.toUpperCase(), {
    x: LAYOUT.marginLeft,
    y: c.y,
    size: FONTS.sectionTitleSize,
    font: c.boldFont,
    color: COLORS.accent,
  });

  c = { ...c, y: c.y - 4 };

  // Underline
  c.page.drawLine({
    start: { x: LAYOUT.marginLeft, y: c.y },
    end: { x: LAYOUT.pageWidth - LAYOUT.marginRight, y: c.y },
    thickness: 0.75,
    color: COLORS.accent,
  });

  c = { ...c, y: c.y - 8 };
  return c;
}

export async function generateResumePDF(
  resume: OptimizedResume
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`${resume.personalInfo.name} - Resume`);
  pdfDoc.setAuthor(resume.personalInfo.name);
  pdfDoc.setSubject('Professional Resume');
  pdfDoc.setCreator('ResumeTailor AI');

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const oblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const firstPage = pdfDoc.addPage([LAYOUT.pageWidth, LAYOUT.pageHeight]);
  const pages = [firstPage];

  let ctx: DrawContext = {
    page: firstPage,
    boldFont,
    regularFont,
    y: LAYOUT.pageHeight - LAYOUT.marginTop,
    pdfDoc,
    pages,
  };

  // ── HEADER ──────────────────────────────────────────────
  const { personalInfo } = resume;

  // Name
  firstPage.drawText(personalInfo.name, {
    x: LAYOUT.marginLeft,
    y: ctx.y,
    size: FONTS.nameSize,
    font: boldFont,
    color: COLORS.accent,
  });
  ctx = { ...ctx, y: ctx.y - FONTS.nameSize - 4 };

  // Contact line 1: email | phone | location
  const contactParts: string[] = [];
  if (personalInfo.email) contactParts.push(personalInfo.email);
  if (personalInfo.phone) contactParts.push(personalInfo.phone);
  if (personalInfo.location) contactParts.push(personalInfo.location);

  if (contactParts.length > 0) {
    ctx.page.drawText(contactParts.join('  |  '), {
      x: LAYOUT.marginLeft,
      y: ctx.y,
      size: FONTS.contactSize,
      font: regularFont,
      color: COLORS.darkGray,
    });
    ctx = { ...ctx, y: ctx.y - FONTS.contactSize - 3 };
  }

  // Contact line 2: linkedin | github | website
  const linkParts: string[] = [];
  if (personalInfo.linkedin) linkParts.push(personalInfo.linkedin);
  if (personalInfo.github) linkParts.push(personalInfo.github);
  if (personalInfo.website) linkParts.push(personalInfo.website);

  if (linkParts.length > 0) {
    ctx.page.drawText(linkParts.join('  |  '), {
      x: LAYOUT.marginLeft,
      y: ctx.y,
      size: FONTS.contactSize,
      font: regularFont,
      color: COLORS.mediumGray,
    });
    ctx = { ...ctx, y: ctx.y - FONTS.contactSize - 3 };
  }

  // Header divider line
  ctx.page.drawLine({
    start: { x: LAYOUT.marginLeft, y: ctx.y },
    end: { x: LAYOUT.pageWidth - LAYOUT.marginRight, y: ctx.y },
    thickness: 1.5,
    color: COLORS.accent,
  });
  ctx = { ...ctx, y: ctx.y - 10 };

  // ── PROFESSIONAL SUMMARY ────────────────────────────────
  ctx = drawSectionDivider(ctx, 'Professional Summary');
  ctx = drawText(
    ctx,
    resume.summary,
    LAYOUT.marginLeft,
    FONTS.bodySize,
    regularFont
  );
  ctx = { ...ctx, y: ctx.y - 4 };

  // ── EXPERIENCE ──────────────────────────────────────────
  if (resume.experience.length > 0) {
    ctx = drawSectionDivider(ctx, 'Professional Experience');

    for (const job of resume.experience) {
      ctx = ensureSpace(ctx, 40);

      // Job title (bold) | company
      const titleLine = `${job.title} — ${job.company}`;
      ctx.page.drawText(titleLine, {
        x: LAYOUT.marginLeft,
        y: ctx.y,
        size: FONTS.jobTitleSize,
        font: boldFont,
        color: COLORS.black,
      });

      // Date range (right-aligned)
      const dateText = `${job.startDate} – ${job.endDate}`;
      const dateWidth = regularFont.widthOfTextAtSize(
        dateText,
        FONTS.contactSize
      );
      ctx.page.drawText(dateText, {
        x: LAYOUT.pageWidth - LAYOUT.marginRight - dateWidth,
        y: ctx.y,
        size: FONTS.contactSize,
        font: regularFont,
        color: COLORS.mediumGray,
      });

      ctx = { ...ctx, y: ctx.y - FONTS.jobTitleSize - 2 };

      // Location (italic)
      if (job.location) {
        ctx.page.drawText(job.location, {
          x: LAYOUT.marginLeft,
          y: ctx.y,
          size: FONTS.contactSize,
          font: oblique,
          color: COLORS.mediumGray,
        });
        ctx = { ...ctx, y: ctx.y - FONTS.contactSize - 3 };
      }

      // Skills
      if (job.skills?.length) {
        const skillsLine = `Core skills: ${job.skills.join(', ')}`;
        ctx = drawText(
          ctx,
          skillsLine,
          LAYOUT.marginLeft,
          FONTS.contactSize,
          oblique,
          COLORS.mediumGray
        );
        ctx = { ...ctx, y: ctx.y - 1 };
      }

      // Achievements (bullet points)
      for (const achievement of job.achievements) {
        ctx = ensureSpace(ctx, FONTS.bodySize + 6);
        const bulletX = LAYOUT.marginLeft + 10;
        const textX = LAYOUT.marginLeft + 20;
        const maxWidth = getContentWidth() - 20;

        ctx.page.drawText('•', {
          x: bulletX,
          y: ctx.y,
          size: FONTS.bodySize,
          font: regularFont,
          color: COLORS.darkGray,
        });

        ctx = drawText(
          ctx,
          achievement,
          textX,
          FONTS.bodySize,
          regularFont,
          COLORS.darkGray,
          maxWidth
        );
      }

      ctx = { ...ctx, y: ctx.y - 6 };
    }
  }

  // ── SKILLS ──────────────────────────────────────────────
  if (resume.skills.length > 0) {
    ctx = drawSectionDivider(ctx, 'Skills');

    for (const category of resume.skills) {
      ctx = ensureSpace(ctx, FONTS.bodySize + 4);

      const categoryLabel = `${category.name}: `;
      const labelWidth = boldFont.widthOfTextAtSize(
        categoryLabel,
        FONTS.bodySize
      );
      const skillsText = category.skills.join(', ');

      ctx.page.drawText(categoryLabel, {
        x: LAYOUT.marginLeft,
        y: ctx.y,
        size: FONTS.bodySize,
        font: boldFont,
        color: COLORS.black,
      });

      ctx = drawText(
        ctx,
        skillsText,
        LAYOUT.marginLeft + labelWidth,
        FONTS.bodySize,
        regularFont,
        COLORS.darkGray,
        getContentWidth() - labelWidth
      );
      ctx = { ...ctx, y: ctx.y - 2 };
    }
    ctx = { ...ctx, y: ctx.y - 4 };
  }

  // ── EDUCATION ───────────────────────────────────────────
  if (resume.education.length > 0) {
    ctx = drawSectionDivider(ctx, 'Education');

    for (const edu of resume.education) {
      ctx = ensureSpace(ctx, 30);

      const degreeText = edu.field
        ? `${edu.degree} in ${edu.field}`
        : edu.degree;
      ctx.page.drawText(degreeText, {
        x: LAYOUT.marginLeft,
        y: ctx.y,
        size: FONTS.jobTitleSize,
        font: boldFont,
        color: COLORS.black,
      });

      const dateText = `${edu.startDate} - ${edu.graduationDate}`;

      const gradWidth = regularFont.widthOfTextAtSize(
        dateText,
        FONTS.contactSize
      );
      ctx.page.drawText(dateText, {
        x: LAYOUT.pageWidth - LAYOUT.marginRight - gradWidth,
        y: ctx.y,
        size: FONTS.contactSize,
        font: regularFont,
        color: COLORS.mediumGray,
      });

      ctx = { ...ctx, y: ctx.y - FONTS.jobTitleSize - 2 };

      const institutionLine = [edu.institution, edu.location]
        .filter(Boolean)
        .join(', ');
      ctx.page.drawText(institutionLine, {
        x: LAYOUT.marginLeft,
        y: ctx.y,
        size: FONTS.bodySize,
        font: regularFont,
        color: COLORS.darkGray,
      });
      ctx = { ...ctx, y: ctx.y - FONTS.bodySize - 2 };

      if (edu.gpa || edu.honors) {
        const extraLine = [edu.gpa ? `GPA: ${edu.gpa}` : null, edu.honors]
          .filter(Boolean)
          .join('  |  ');
        ctx.page.drawText(extraLine, {
          x: LAYOUT.marginLeft,
          y: ctx.y,
          size: FONTS.contactSize,
          font: oblique,
          color: COLORS.mediumGray,
        });
        ctx = { ...ctx, y: ctx.y - FONTS.contactSize - 2 };
      }

      ctx = { ...ctx, y: ctx.y - 6 };
    }
  }

  // ── CERTIFICATIONS ──────────────────────────────────────
  if (resume.certifications && resume.certifications.length > 0) {
    ctx = drawSectionDivider(ctx, 'Certifications');

    for (const cert of resume.certifications) {
      ctx = ensureSpace(ctx, FONTS.bodySize + 4);
      const certLine = [cert.name, cert.issuer, cert.date]
        .filter(Boolean)
        .join(' | ');
      ctx = drawText(
        ctx,
        `• ${certLine}`,
        LAYOUT.marginLeft + 10,
        FONTS.bodySize,
        regularFont,
        COLORS.darkGray
      );
    }
    ctx = { ...ctx, y: ctx.y - 4 };
  }

  // ── PROJECTS ────────────────────────────────────────────
  if (resume.projects && resume.projects.length > 0) {
    ctx = drawSectionDivider(ctx, 'Projects');

    for (const project of resume.projects) {
      ctx = ensureSpace(ctx, 30);

      ctx.page.drawText(project.name, {
        x: LAYOUT.marginLeft,
        y: ctx.y,
        size: FONTS.jobTitleSize,
        font: boldFont,
        color: COLORS.black,
      });
      ctx = { ...ctx, y: ctx.y - FONTS.jobTitleSize - 2 };

      ctx = drawText(
        ctx,
        project.description,
        LAYOUT.marginLeft,
        FONTS.bodySize,
        regularFont,
        COLORS.darkGray
      );

      if (project.technologies && project.technologies.length > 0) {
        const techText = `Technologies: ${project.technologies.join(', ')}`;
        ctx = drawText(
          ctx,
          techText,
          LAYOUT.marginLeft,
          FONTS.contactSize,
          oblique,
          COLORS.mediumGray
        );
      }

      ctx = { ...ctx, y: ctx.y - 6 };
    }
  }

  // ── LANGUAGES ────────────────────────────────────────────
  if (resume.languages && resume.languages.length > 0) {
    ctx = drawSectionDivider(ctx, 'Languages');

    const languagesText = resume.languages
      .map((item) => `${item.language} (${item.level})`)
      .join(' | ');

    ctx = drawText(
      ctx,
      languagesText,
      LAYOUT.marginLeft,
      FONTS.bodySize,
      regularFont,
      COLORS.darkGray
    );
    ctx = { ...ctx, y: ctx.y - 4 };
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

export function pdfToBase64(pdfBytes: Uint8Array): string {
  return Buffer.from(pdfBytes).toString('base64');
}
