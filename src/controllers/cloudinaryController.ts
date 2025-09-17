import { Response } from 'express';
import { AuthRequest } from '../types';
import { cloudinary } from '../utils/multer';
import {
  __requestResponse,
  RESPONSE_CODES,
  RESPONSE_MESSAGES,
} from '../utils/constants';

// Get all Cloudinary resources
export const getCloudinaryResources = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      resource_type = 'image',
      type = 'upload',
      max_results = 30,
      next_cursor,
      prefix,
      tags,
      sort_by = 'created_at',
      direction = 'desc'
    } = req.query;

    // Validate resource_type
    const validResourceTypes = ['image', 'video', 'raw'];
    const resourceType = validResourceTypes.includes(resource_type as string) 
      ? resource_type as string 
      : 'image';

    const searchParams: any = {
      resource_type: resourceType,
      type,
      max_results: parseInt(max_results as string),
      sort_by: `${sort_by}:${direction}`,
    };

    if (next_cursor) searchParams.next_cursor = next_cursor;
    if (prefix) searchParams.prefix = prefix;
    if (tags) {
      searchParams.tags = Array.isArray(tags) ? tags : [tags];
    }

    const result = await cloudinary.api.resources(searchParams);

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(
        RESPONSE_CODES.SUCCESS,
        RESPONSE_MESSAGES.SUCCESS,
        {
          resources: result.resources || [],
          next_cursor: result.next_cursor,
          total_count: result.total_count || 0,
        }
      )
    );
  } catch (error: any) {
    console.error('Cloudinary API Error:', error);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json(
      __requestResponse(
        RESPONSE_CODES.INTERNAL_SERVER_ERROR,
        'Failed to fetch Cloudinary resources',
        { error: error.message }
      )
    );
  }
};

// Search Cloudinary media
export const searchCloudinaryMedia = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      query,
      resource_type = 'image',
      max_results = 30,
      next_cursor,
      sort_by = 'created_at',
      direction = 'desc'
    } = req.query;

    if (!query) {
      res.status(RESPONSE_CODES.BAD_REQUEST).json(
        __requestResponse(RESPONSE_CODES.BAD_REQUEST, 'Search query is required')
      );
      return;
    }

    const searchParams: any = {
      expression: `resource_type:${resource_type} AND ${query}`,
      max_results: parseInt(max_results as string),
      sort_by: `${sort_by}:${direction}`,
    };

    if (next_cursor) searchParams.next_cursor = next_cursor;

    const result = await cloudinary.search.expression(searchParams.expression)
      .max_results(searchParams.max_results)
      .sort_by(searchParams.sort_by)
      .execute();

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(
        RESPONSE_CODES.SUCCESS,
        RESPONSE_MESSAGES.SUCCESS,
        {
          resources: result.resources,
          next_cursor: result.next_cursor,
          total_count: result.total_count,
        }
      )
    );
  } catch (error) {
    console.error('Cloudinary Search Error:', error);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json(
      __requestResponse(
        RESPONSE_CODES.INTERNAL_SERVER_ERROR,
        'Failed to search Cloudinary media'
      )
    );
  }
};

// Get Cloudinary folders
export const getCloudinaryFolders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await cloudinary.api.root_folders();
    
    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(
        RESPONSE_CODES.SUCCESS,
        RESPONSE_MESSAGES.SUCCESS,
        {
          folders: result.folders,
        }
      )
    );
  } catch (error) {
    console.error('Cloudinary Folders Error:', error);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json(
      __requestResponse(
        RESPONSE_CODES.INTERNAL_SERVER_ERROR,
        'Failed to fetch Cloudinary folders'
      )
    );
  }
};

// Get resources by folder
export const getCloudinaryResourcesByFolder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { folder } = req.params;
    const {
      resource_type = 'image',
      max_results = 30,
      next_cursor,
      sort_by = 'created_at',
      direction = 'desc'
    } = req.query;

    const searchParams: any = {
      type: 'upload',
      prefix: folder,
      resource_type,
      max_results: parseInt(max_results as string),
      sort_by: `${sort_by}:${direction}`,
    };

    if (next_cursor) searchParams.next_cursor = next_cursor;

    const result = await cloudinary.api.resources(searchParams);

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(
        RESPONSE_CODES.SUCCESS,
        RESPONSE_MESSAGES.SUCCESS,
        {
          resources: result.resources,
          next_cursor: result.next_cursor,
          total_count: result.total_count,
        }
      )
    );
  } catch (error) {
    console.error('Cloudinary Folder Resources Error:', error);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json(
      __requestResponse(
        RESPONSE_CODES.INTERNAL_SERVER_ERROR,
        'Failed to fetch folder resources'
      )
    );
  }
};

// Get resources by type
export const getCloudinaryResourcesByType = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { resourceType } = req.params;
    const {
      max_results = 30,
      next_cursor,
      sort_by = 'created_at',
      direction = 'desc'
    } = req.query;

    const searchParams: any = {
      resource_type: resourceType,
      type: 'upload',
      max_results: parseInt(max_results as string),
      sort_by: `${sort_by}:${direction}`,
    };

    if (next_cursor) searchParams.next_cursor = next_cursor;

    const result = await cloudinary.api.resources(searchParams);

    res.status(RESPONSE_CODES.SUCCESS).json(
      __requestResponse(
        RESPONSE_CODES.SUCCESS,
        RESPONSE_MESSAGES.SUCCESS,
        {
          resources: result.resources,
          next_cursor: result.next_cursor,
          total_count: result.total_count,
        }
      )
    );
  } catch (error) {
    console.error('Cloudinary Type Resources Error:', error);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json(
      __requestResponse(
        RESPONSE_CODES.INTERNAL_SERVER_ERROR,
        'Failed to fetch resources by type'
      )
    );
  }
};