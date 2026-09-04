// Se asegura de que todos los tests usen la base de datos "testdb"
// en vez de "red_bicicletas" (la real), sin importar el orden en
// que Jasmine cargue los archivos de spec.
process.env.NODE_ENV = 'test';
