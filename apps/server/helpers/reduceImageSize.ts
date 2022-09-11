import type { NextFunction } from 'express'
import fs from 'fs'
import sharp from 'sharp'

import { ApiError } from '@online-library/tools'

import { deleteTemporaryFile } from 'helpers'

export const reduceImageSize = async (path: string, next: NextFunction) =>
   sharp(path)
      .rotate()
      .resize(800)
      .jpeg({ quality: 75 })
      .toBuffer((error, buffer) => {
         if (error) {
            deleteTemporaryFile(path)
            next(
               new ApiError(
                  'Sending a file',
                  'There was an unexpected problem when sending the file',
                  500
               )
            )
         }

         fs.writeFileSync(path, buffer)

         next()
      })
