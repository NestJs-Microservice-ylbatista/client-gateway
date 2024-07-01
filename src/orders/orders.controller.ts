/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query, ParseUUIDPipe } from '@nestjs/common';

import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { catchError } from 'rxjs';
import { CreateOrderDto, OrderPaginationDto, StatusDto } from './dto';

@Controller('orders')
export class OrdersController {
  
  constructor(
    @Inject(NATS_SERVICE) private readonly natsClient: ClientProxy,
  ) {}

  //**CREAR ORDEN */
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    // return this.ordersService.create(createOrderDto);
    return this.natsClient.send('createOrder', createOrderDto);
  }

  //**OBTENER TODAS LAS ORDENES */
  @Get()
  findAll( @Query() orderPaginationDto: OrderPaginationDto ) {
    return this.natsClient.send('findAllOrders', orderPaginationDto)
      //manejo de error mediante un observable
      .pipe(
        catchError( err => { throw new RpcException( err ) } )
      );
  }

  //**OBTENER ORDEN POR ID */
  @Get('id/:id')
  async findOrder(@Param('id', ParseUUIDPipe) id: string) {
    // return this.ordersService.findOne(+id);
    return this.natsClient.send('findOneOrder', {id})
      .pipe(//manejo la exepcion para los errores, posible not found
        catchError( err => { throw new RpcException(err) } )
      )
  }



  //**OBTENER ORDEN POR STATUS */
  @Get(':status')
  async findAllByStatus(
    @Param() statusDto: StatusDto,
    @Query() paginationDto: PaginationDto,
  ) {
    //manejo de error mediante promesa
    try {
      
      return this.natsClient.send('findAllOrders', {
        ...paginationDto,
        status: statusDto.status,
      })

    } catch (error) {
      throw new RpcException(error);
    }

  }


 
  //**CHANGE STATUS, UPDATE ORDER */
  @Patch(':id')
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: StatusDto,
  ) {

   try {
     return this.natsClient.send('changeOrderStatus', {id, status:statusDto.status})
    
    } catch (error) {
      throw new RpcException( error );
   }
  
  }




  @Delete(':id')
  remove(@Param('id') id: string) {
    // return this.ordersService.remove(+id);
  }
}
