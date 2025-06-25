export const getAddressComponent = (
  components: google.maps.places.AddressComponent[],
  type: string
) => components.find((c) => c.types.includes(type))?.longText || '';
