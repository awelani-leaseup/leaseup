export const getAddressComponent = (
  components: google.maps.places.AddressComponent[],
  type: string,
  longText: boolean = true
) => {
  const component = components.find((c) => c.types.includes(type));
  if (!component) return '';
  return longText ? component.longText : component.shortText;
};
