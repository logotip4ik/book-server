import graphqlFields from 'graphql-fields';

export function processFields(info: any) {
  const fields = graphqlFields(info);

  function process(obj: Object, select: Boolean = false): Object {
    const keys = Object.keys(obj);
    if (keys.length === 0) return true;
    return keys.reduce((acc, key) => {
      if (select) {
        return {
          select: {
            // @ts-ignore
            ...acc.select,
            // @ts-ignore
            [key]: process(obj[key], true),
          },
        };
      }
      // @ts-ignore
      return { ...acc, [key]: process(obj[key], true) };
    }, {});
  }

  return process(fields);
}
