import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import type { Tour } from './types';

// Helper to fetch image as ArrayBuffer for docx using Image element for better CDN/CORS support
async function fetchImageAsBuffer(url: string): Promise<ArrayBuffer | null> {
  if (!url) return null;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        
        // Convert canvas to blob then to arrayBuffer
        canvas.toBlob(async (blob) => {
          if (blob) {
            const buffer = await blob.arrayBuffer();
            resolve(buffer);
          } else {
            resolve(null);
          }
        }, 'image/jpeg', 0.8);
      } catch (e) {
        console.warn('Canvas conversion failed for docx image:', url, e);
        resolve(null);
      }
    };
    img.onerror = () => {
      console.warn('Skipping image for docx due to load failure:', url);
      resolve(null);
    };
    img.src = url;
  });
}

export async function exportTourToDocx(tour: Tour) {
  // Pre-load all images first
  const mainImageBuffer = tour.mainImage?.url ? await fetchImageAsBuffer(tour.mainImage.url) : null;
  
  const galleryImageBuffers: { buffer: ArrayBuffer; caption: string }[] = [];
  if (tour.images && tour.images.length > 0) {
    const results = await Promise.all(
      tour.images.slice(0, 10).map(async (img) => {
        const buffer = await fetchImageAsBuffer(img.url);
        return buffer ? { buffer, caption: img.caption || "" } : null;
      })
    );
    results.forEach(res => {
      if (res) galleryImageBuffers.push(res);
    });
  }

  const children: any[] = [
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
  ];

  // Main Image
  if (mainImageBuffer) {
    children.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: mainImageBuffer,
            transformation: {
              width: 600,
              height: 400,
            },
          } as any),
        ],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: "", spacing: { after: 200 } })
    );
  }

  // Description
  children.push(
    new Paragraph({
      text: "Description",
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: tour.description.replace(/<[^>]*>?/gm, ''),
        }),
      ],
    }),
    new Paragraph({ text: "", spacing: { after: 200 } })
  );

  // Itinerary
  children.push(
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
        spacing: { after: 300 }, // Added spacing after each day's description
      }),
    ]),
    new Paragraph({ text: "", spacing: { after: 100 } })
  );

  // Gallery
  if (galleryImageBuffers.length > 0) {
    children.push(
      new Paragraph({ text: "Gallery", heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ text: "", spacing: { after: 200 } })
    );

    for (const res of galleryImageBuffers) {
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: res.buffer,
              transformation: {
                width: 500,
                height: 350,
              },
            } as any),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: res.caption,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }
  }

  // Inclusions/Exclusions
  children.push(
    new Paragraph({
      text: "Inclusions",
      heading: HeadingLevel.HEADING_2,
    }),
    ...tour.inclusions.map((item) => new Paragraph({ text: item, bullet: { level: 0 } })),
    new Paragraph({ text: "", spacing: { after: 200 } }),

    new Paragraph({
      text: "Exclusions",
      heading: HeadingLevel.HEADING_2,
    }),
    ...tour.exclusions.map((item) => new Paragraph({ text: item, bullet: { level: 0 } })),
    new Paragraph({ text: "", spacing: { after: 200 } })
  );

  // Gears
  if (tour.gears && tour.gears.length > 0) {
    children.push(
      new Paragraph({
        text: "Gear and Equipment",
        heading: HeadingLevel.HEADING_2,
      }),
      ...tour.gears.map((gear) => new Paragraph({ 
        text: `${gear.name}${gear.provided ? ' (Provided)' : ' (Bring your own)'}${gear.description ? `: ${gear.description}` : ''}`, 
        bullet: { level: 0 } 
      })),
      new Paragraph({ text: "", spacing: { after: 200 } })
    );
  }

  // FAQ
  if (tour.faq && tour.faq.length > 0) {
    children.push(
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
    );
  }

  // Reviews
  if (tour.reviews && tour.reviews.length > 0) {
    children.push(
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
    );
  }

  // Map
  if (tour.map) {
    children.push(
      new Paragraph({
        text: "Map of the trek",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: "You can view the interactive map for this trek here: ",
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: tour.map,
            color: "0066CC",
            underline: {},
          }),
        ],
      }),
      new Paragraph({ text: "", spacing: { after: 200 } })
    );
  }

  // CTA
  children.push(
    new Paragraph({ text: "", spacing: { after: 400 } }),
    new Paragraph({
      text: "Book this trip at: https://happymountainnepal.com/tours/" + tour.slug,
      alignment: AlignmentType.CENTER,
      style: "Hyperlink",
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${tour.slug}.docx`);
}
