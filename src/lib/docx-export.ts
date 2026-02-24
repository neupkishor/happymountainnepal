import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import type { Tour } from './types';

export async function exportTourToDocx(tour: Tour) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: tour.name,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Type: ${tour.type} | Difficulty: ${tour.difficulty} | Duration: ${tour.duration} days`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Price: $${tour.price}`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "", spacing: { after: 200 } }),

          new Paragraph({
            text: "Description",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: tour.description.replace(/<[^>]*>?/gm, ''), // Simple HTML tag removal
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }),
          new Paragraph({
            text: "Itinerary",
            heading: HeadingLevel.HEADING_2,
          }),
          ...tour.itinerary.flatMap((item) => [
            new Paragraph({
              text: `Day ${item.day}: ${item.title}`,
              heading: HeadingLevel.HEADING_3,
            }),
            new Paragraph({
              text: item.description,
            }),
          ]),

          new Paragraph({ text: "", spacing: { after: 200 } }),
          new Paragraph({
            text: "Inclusions",
            heading: HeadingLevel.HEADING_2,
          }),
          ...tour.inclusions.map((item) => new Paragraph({ text: `• ${item}`, bullet: { level: 0 } })),

          new Paragraph({ text: "", spacing: { after: 200 } }),
          new Paragraph({
            text: "Exclusions",
            heading: HeadingLevel.HEADING_2,
          }),
          ...tour.exclusions.map((item) => new Paragraph({ text: `• ${item}`, bullet: { level: 0 } })),

          ...(tour.gears && tour.gears.length > 0 ? [
            new Paragraph({ text: "", spacing: { after: 200 } }),
            new Paragraph({
              text: "Gear and Equipment",
              heading: HeadingLevel.HEADING_2,
            }),
            ...tour.gears.map((gear) => new Paragraph({ 
              text: `• ${gear.name}${gear.provided ? ' (Provided)' : ' (Bring your own)'}${gear.description ? `: ${gear.description}` : ''}`, 
              bullet: { level: 0 } 
            }))
          ] : []),

          ...(tour.faq && tour.faq.length > 0 ? [
            new Paragraph({ text: "", spacing: { after: 200 } }),
            new Paragraph({
              text: "Frequently Asked Questions",
              heading: HeadingLevel.HEADING_2,
            }),
            ...tour.faq.flatMap((f) => [
              new Paragraph({ 
                children: [
                  new TextRun({
                    text: `Q: ${f.question}`,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({ text: `A: ${f.answer}` }),
              new Paragraph({ text: "" }),
            ])
          ] : []),

          ...(tour.reviews && tour.reviews.length > 0 ? [
            new Paragraph({ text: "", spacing: { after: 200 } }),
            new Paragraph({
              text: "Reviews",
              heading: HeadingLevel.HEADING_2,
            }),
            ...tour.reviews.flatMap((r) => [
              new Paragraph({ 
                children: [
                  new TextRun({
                    text: `${r.author} (${r.rating}/5)`,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({ text: r.comment }),
              new Paragraph({ text: "" }),
            ])
          ] : []),

          new Paragraph({ text: "", spacing: { after: 400 } }),
          new Paragraph({
            text: "Book this trip at: https://happymountainnepal.com/tours/" + tour.slug,
            alignment: AlignmentType.CENTER,
            style: "Hyperlink",
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${tour.slug}.docx`);
}
