/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { PaginationDto } from 'src/common';
import { NATS_SERVICE } from 'src/config';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {

  constructor(
    @Inject(NATS_SERVICE) private readonly natsClient: ClientProxy,
  ) {}

    //**CREAR PRODUCTO */
  @Post()
  createProduct( @Body() createProductDto: CreateProductDto ){
    return this.natsClient.send( { cmd: 'create_product' }, createProductDto );
    // return ' crea un product';
  }
  //**OBTENER TODOS LOS PRODUCTOS */
  @Get()
  findAllProducts( @Query() paginationDto: PaginationDto ) {
    return this.natsClient.send( {cmd: 'find_all_products'}, paginationDto );
  }

  
  //**OBTENER PRODUCTO POR ID */
  @Get(':id')
  async findProduct( @Param('id', ParseIntPipe ) id: number ) {
    //*metodo 1 observable
    return this.natsClient.send( {cmd: 'find_one_product'}, { id } )
    .pipe(
      catchError( err => { throw new RpcException(err) } )
    );

      //*metodo 2 promesas
    // try {
    //   const product = await firstValueFrom(
    //     this.productsClient.send( { cmd: 'find_one_product' }, { id } )
    //   );
    //   return product;
      
    // } catch (error) {
    //   console.log(error);
    //   throw new RpcException(error)
    // }
    
  }


  //**DELETE PRODUCTO */
  @Delete(':id')
  deleteProduct( @Param('id') id: string ) {
    // console.log(+id);
    
    return this.natsClient.send( { cmd: 'delete_product' }, {
      id,
    } ).pipe(//manejo la exepcion para los errores, posible not found
      catchError( err => { throw new RpcException( err ) } ),
    )
  }


  //**UPDATE PRODUCTO */
  @Patch(':id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    ) {
      // return {
      //   id, updateProductDto
      // }
      return this.natsClient.send( { cmd: 'update_product' }, {
        id,//envio id
        ...updateProductDto
      }).pipe(//manejo la exepcion para los errores, posible not found
        catchError( err => { throw new RpcException( err ) } ),
      );

  }

}
