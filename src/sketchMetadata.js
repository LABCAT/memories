export const sketchMetadata = {
  'number-2': {
    title: '#MemoriesNo2',
    description: 'Photo-sampled particles drift across a memory.',
    sketch: 'MemoriesNo2.js',
  },
  'number-1': {
    title: '#MemoriesNo1',
    description: 'Every melody note lays another Japan 2018 memory onto the pile.',
    sketch: 'MemoriesNo1.js',
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
