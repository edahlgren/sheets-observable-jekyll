const fields = [
  [ "Field", "Description", "Caption", "Type", "Distribution" ],
  [ "year", "Year", "Year" , "date", "grouped" ],
  [ "state", "State", "State", "location", "grouped" ],
  [ "region", "Region", "Region", "location", "grouped" ],
  [ "kidney_disease", "Kidney disease", "Percent with kidney disease", "numerical", "random" ],
  [ "pulmonary_disease", "Pulmonary disease", "Percent with pulmonary disease", "numerical", "random" ],
  [ "diabetes", "Diabetes", "Percent with diabetes", "numerical", "random" ],
  [ "obese", "Obese", "Percent obese", "numerical", "random" ],
  [ "no_leisure", "No leisure", "Percent without leisure exercise", "numerical", "random" ],
  [ "overweight", "Overweight", "Percent overweight", "numerical", "random" ],
  [ "healthy_weight", "Healthy weight", "Percent with healthy weight", "numerical", "random" ]
];

const data = [
  [ "year", "state", "region", "kidney_disease", "pulmonary_disease", "diabetes", "obese", "no_leisure", "overweight", "healthy_weight" ],
  [ 2011, "AK", "West", 5,5.2,7.9,27.4,22,66.3,32.3 ],
  [ 2011, "AL", "South", 2.7,9.6,11.8,32,32.6,66.7,31.3 ],
  [ 2011, "AR", "South", 3,8,10.4,30.9,30.9,64.9,32.8 ],
  [ 2011, "AZ", "West", 3.5,5.3,9.5,25.1,24.1,62.3,35.1 ],
  [ 2011, "CA", "West", 2.6,4.6,8.9,23.8,19.1,60.2,37.7 ],
  [ 2011, "CO", "West", 2.2,4.6,6.7,20.7,16.5,56.1,41.6 ],
  [ 2011, "CT", "Northeast", 1.9,6.1,9.3,24.5,25.5,59.6,38.4 ],
  [ 2011, "DC", "South", 2.7,4.6,9.1,23.7,19.8,52.9,45.4 ],
  [ 2011, "DE", "South", 2.5,5.2,9.7,28.8,27,63.8,34.6 ],
  [ 2011, "FL", "South", 3.2,7.9,10.4,26.6,26.9,63.3,34.9 ],
  [ 2011, "GA", "South", 2.8,7,10.2,28,26.7,62.7,35.3 ],
  [ 2011, "HI", "West", 3.3,4.4,8.4,21.8,21.3,55.7,41.6 ],
  [ 2011, "IA", "Midwest", 1.5,5.1,8.2,29,25.9,64.8,33.7 ],
  [ 2011, "ID", "West", 2.4,5.2,9.4,27,21.4,62.3,35.5 ],
  [ 2011, "IL", "Midwest", 2.8,6.1,9.7,27.1,25.1,64.1,34.1 ],
  [ 2011, "IN", "Midwest", 2.1,8.3,10.2,30.8,29.2,65.6,32.4 ],
  [ 2011, "KS", "Midwest", 2.3,6.6,9.5,29.6,26.8,64.4,33.8 ],
  [ 2011, "KY", "South", 2.5,9.8,10.8,30.4,29.3,66.5,31.6 ],
  [ 2011, "LA", "South", 2.6,6.9,11.8,33.4,33.8,67.6,30.6 ],
  [ 2011, "MA", "Northeast", 1.9,5.8,8,22.7,23.5,59.3,38.8 ],
  [ 2011, "MD", "South", 1.9,5.9,9.5,28.3,26.2,64.4,33.9 ],
  [ 2011, "ME", "Northeast", 2.4,7.8,9.6,27.8,23,65,33.4 ],
  [ 2011, "MI", "Midwest", 3,8,10,31.3,23.6,65.4,33 ],
  [ 2011, "MN", "Midwest", 1.7,4.1,7.3,25.7,21.9,62.4,35.8 ],
  [ 2011, "MO", "Midwest", 2.3,8.1,10.2,30.3,28.4,64.8,33.6 ],
  [ 2011, "MS", "South", 2.4,8.3,12.3,34.9,36,68.9,28.9 ],
  [ 2011, "MT", "West", 2.5,6,8,24.6,24.4,60.3,38.3 ]
];

export default {
  fields: fields,
  data: data
};
