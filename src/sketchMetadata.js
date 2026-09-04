export const sketchMetadata = {
  'number-1': {
    title: '#MemoriesNo1',
    description: 'Photo-sampled particles drift across a memory.',
    sketch: 'MemoriesNo1.js',
  },
  'number-2': {
    title: '#MemoriesNo2',
    description: 'MIDI-cued colour flashes and a centered ellipse.',
    sketch: 'MemoriesNo2.js',
  },
};

export function getAllSketches() {
  return Object.keys(sketchMetadata).map(id => ({
    id,
    ...sketchMetadata[id],
  }));
}

export function getSketchById(id) {
  return sketchMetadata[id] || null;
}
